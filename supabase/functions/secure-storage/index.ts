import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Buckets that require authentication to upload
const AUTH_REQUIRED_BUCKETS = [
  "customer-documents",
  "contract-documents",
  "internal-documents",
];

// Buckets that allow anonymous uploads (public forms)
const ANON_UPLOAD_BUCKETS = [
  "resumes",
  "ombudsman-attachments",
  "form-attachments",
];

// Buckets that allow download with ownership check
const OWNER_DOWNLOAD_BUCKETS = [
  "customer-documents",
  "contract-documents",
];

// All valid buckets
const ALL_BUCKETS = [
  ...AUTH_REQUIRED_BUCKETS,
  ...ANON_UPLOAD_BUCKETS,
  "property-images",
  "internal-documents",
];

// Max file sizes per bucket (bytes)
const MAX_FILE_SIZES: Record<string, number> = {
  "customer-documents": 10 * 1024 * 1024,
  "contract-documents": 10 * 1024 * 1024,
  "internal-documents": 10 * 1024 * 1024,
  "ombudsman-attachments": 10 * 1024 * 1024,
  "form-attachments": 10 * 1024 * 1024,
  "resumes": 5 * 1024 * 1024,
  "property-images": 20 * 1024 * 1024,
};

// Allowed MIME types per bucket
const ALLOWED_MIMES: Record<string, string[]> = {
  "customer-documents": ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  "contract-documents": ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  "internal-documents": ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"],
  "ombudsman-attachments": ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  "form-attachments": ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  "resumes": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  "property-images": ["image/jpeg", "image/png", "image/webp"],
};

// Dangerous file extensions (double extension attacks)
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".msi", ".dll", ".com", ".scr", ".pif", ".hta", ".cpl", ".inf", ".reg", ".ws", ".wsf", ".php", ".asp", ".aspx", ".jsp", ".cgi", ".py", ".pl", ".rb", ".html", ".htm", ".svg"];

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateSecureFilename(originalName: string): string {
  const ext = originalName.includes(".")
    ? "." + originalName.split(".").pop()!.toLowerCase()
    : "";
  return `${crypto.randomUUID()}${ext}`;
}

function hasBlockedExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return BLOCKED_EXTENSIONS.some((ext) => lower.includes(ext));
}

async function auditLog(
  serviceClient: ReturnType<typeof createClient>,
  userId: string | null,
  action: string,
  metadata: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await serviceClient.from("audit_log").insert({
      user_id: userId,
      action,
      resource: "storage",
      result: "success",
      metadata,
      target_type: "storage",
      target_id: metadata.bucket as string,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });
  } catch {
    // Don't fail the request if audit logging fails
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 500);

    const url = new URL(req.url);
    const action = url.searchParams.get("action"); // upload | download | delete

    if (!action || !["upload", "download", "delete"].includes(action)) {
      return jsonResponse({ error: "Ação inválida. Use: upload, download, delete" }, 400);
    }

    // Extract auth token
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Create user-scoped client (if authenticated)
    let userId: string | null = null;
    let userRoles: string[] = [];

    if (token && token !== SUPABASE_ANON_KEY) {
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user }, error } = await userClient.auth.getUser();
      if (error || !user) {
        // Token provided but invalid
        return jsonResponse({ error: "Token de autenticação inválido" }, 401);
      }
      userId = user.id;

      // Fetch roles
      const { data: roles } = await userClient.rpc("get_my_roles");
      userRoles = (roles as string[]) || [];
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ============================================================
    // UPLOAD
    // ============================================================
    if (action === "upload") {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const bucket = formData.get("bucket") as string | null;
      const folder = formData.get("folder") as string | null; // e.g. user_id for ownership

      if (!file || !bucket) {
        return jsonResponse({ error: "Campos obrigatórios: file, bucket" }, 400);
      }

      // Validate bucket
      if (!ALL_BUCKETS.includes(bucket)) {
        return jsonResponse({ error: "Bucket inválido" }, 400);
      }

      // Auth check for protected buckets
      if (AUTH_REQUIRED_BUCKETS.includes(bucket) && !userId) {
        return jsonResponse({ error: "Autenticação necessária para este bucket" }, 401);
      }

      // Role checks for specific buckets
      if (bucket === "internal-documents") {
        const isAdmin = userRoles.includes("administrativo") || userRoles.includes("superadmin");
        if (!isAdmin) return jsonResponse({ error: "Sem permissão para upload neste bucket" }, 403);
      }
      if (bucket === "customer-documents" || bucket === "contract-documents") {
        const isAdmin = userRoles.includes("administrativo") || userRoles.includes("superadmin");
        if (!isAdmin) return jsonResponse({ error: "Sem permissão para upload neste bucket" }, 403);
      }
      if (bucket === "property-images") {
        const canUpload = userRoles.some(r => ["corretor", "vendas", "administrativo", "superadmin"].includes(r));
        if (!canUpload) return jsonResponse({ error: "Sem permissão para upload de imagens" }, 403);
      }

      // Validate file size
      const maxSize = MAX_FILE_SIZES[bucket] || 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return jsonResponse({ error: `Arquivo excede o tamanho máximo de ${Math.round(maxSize / 1024 / 1024)}MB` }, 400);
      }

      // Validate MIME type
      const allowedMimes = ALLOWED_MIMES[bucket];
      if (allowedMimes && !allowedMimes.includes(file.type)) {
        return jsonResponse({ error: `Tipo de arquivo não permitido: ${file.type}` }, 400);
      }

      // Block dangerous extensions
      if (hasBlockedExtension(file.name)) {
        return jsonResponse({ error: "Extensão de arquivo bloqueada por segurança" }, 400);
      }

      // Generate secure, non-predictable filename
      const secureName = generateSecureFilename(file.name);
      const path = folder ? `${folder}/${secureName}` : secureName;

      // Upload via service role (bypasses RLS for controlled upload)
      const { data, error } = await serviceClient.storage
        .from(bucket)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        return jsonResponse({ error: "Falha no upload: " + error.message }, 500);
      }

      // Audit log
      await auditLog(serviceClient, userId, "file_upload", {
        bucket,
        path: data.path,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      });

      return jsonResponse({
        path: data.path,
        bucket,
        size: file.size,
        originalName: file.name,
      });
    }

    // ============================================================
    // DOWNLOAD (signed URL)
    // ============================================================
    if (action === "download") {
      const body = await req.json();
      const { bucket, path } = body;

      if (!bucket || !path) {
        return jsonResponse({ error: "Campos obrigatórios: bucket, path" }, 400);
      }

      if (!ALL_BUCKETS.includes(bucket)) {
        return jsonResponse({ error: "Bucket inválido" }, 400);
      }

      // Public bucket (property-images) — generate short-lived URL
      if (bucket === "property-images") {
        const { data, error } = await serviceClient.storage
          .from(bucket)
          .createSignedUrl(path, 300); // 5 min

        if (error) return jsonResponse({ error: "Erro ao gerar URL" }, 500);

        await auditLog(serviceClient, userId, "file_download", { bucket, path });
        return jsonResponse({ url: data.signedUrl, expiresIn: 300 });
      }

      // All private buckets require auth
      if (!userId) {
        return jsonResponse({ error: "Autenticação necessária" }, 401);
      }

      // Ownership check for client-facing buckets
      if (OWNER_DOWNLOAD_BUCKETS.includes(bucket)) {
        const isInternal = userRoles.some(r =>
          ["corretor", "locacao", "vendas", "financeiro", "administrativo", "superadmin"].includes(r)
        );
        // If not internal, check ownership via folder structure
        if (!isInternal) {
          const pathParts = path.split("/");
          if (pathParts[0] !== userId) {
            return jsonResponse({ error: "Sem permissão para acessar este arquivo" }, 403);
          }
        }
      }

      // Admin-only buckets
      if (["ombudsman-attachments", "form-attachments", "internal-documents", "resumes"].includes(bucket)) {
        const isInternal = userRoles.some(r =>
          ["administrativo", "superadmin"].includes(r)
        );
        // resumes and ombudsman are admin-only read
        if (!isInternal) {
          return jsonResponse({ error: "Sem permissão para acessar este arquivo" }, 403);
        }
      }

      // Generate short-lived signed URL (60 seconds)
      const { data, error } = await serviceClient.storage
        .from(bucket)
        .createSignedUrl(path, 60);

      if (error) return jsonResponse({ error: "Erro ao gerar URL" }, 500);

      await auditLog(serviceClient, userId, "file_download", { bucket, path });
      return jsonResponse({ url: data.signedUrl, expiresIn: 60 });
    }

    // ============================================================
    // DELETE
    // ============================================================
    if (action === "delete") {
      const body = await req.json();
      const { bucket, path } = body;

      if (!bucket || !path) {
        return jsonResponse({ error: "Campos obrigatórios: bucket, path" }, 400);
      }

      if (!userId) {
        return jsonResponse({ error: "Autenticação necessária" }, 401);
      }

      // Only admins can delete files
      const isAdmin = userRoles.includes("administrativo") || userRoles.includes("superadmin");
      if (!isAdmin) {
        return jsonResponse({ error: "Sem permissão para excluir arquivos" }, 403);
      }

      const { error } = await serviceClient.storage.from(bucket).remove([path]);
      if (error) return jsonResponse({ error: "Falha ao excluir: " + error.message }, 500);

      await auditLog(serviceClient, userId, "file_delete", { bucket, path });
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Ação não reconhecida" }, 400);
  } catch (err) {
    console.error("secure-storage error:", err);
    return jsonResponse({ error: "Erro interno do servidor" }, 500);
  }
});
