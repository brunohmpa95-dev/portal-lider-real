import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Rate limit: max submissions per IP per form per window
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  contact: { max: 3, windowMs: 600_000 },        // 3 per 10 min
  listing: { max: 2, windowMs: 600_000 },         // 2 per 10 min
  ombudsman: { max: 2, windowMs: 600_000 },       // 2 per 10 min
  career: { max: 2, windowMs: 600_000 },          // 2 per 10 min
  property_lead: { max: 5, windowMs: 600_000 },   // 5 per 10 min
  support: { max: 5, windowMs: 600_000 },         // 5 per 10 min
};

// In-memory rate limit store (resets on cold start, acceptable for edge functions)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, formType: string): boolean {
  const limit = RATE_LIMITS[formType] || { max: 3, windowMs: 600_000 };
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > limit.max) return true;
  return false;
}

function sanitize(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>/g, "")  // strip HTML
    .replace(/[<>"'`;]/g, "") // strip dangerous chars
    .trim()
    .slice(0, 5000);          // hard limit
}

function sanitizeShort(str: string | undefined | null, max = 255): string {
  return sanitize(str).slice(0, max);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function validatePhone(phone: string): boolean {
  if (!phone) return true; // optional
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function auditLog(
  client: ReturnType<typeof createClient>,
  params: {
    userId?: string | null;
    action: string;
    resource: string;
    targetId?: string;
    result: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  try {
    await client.from("audit_log").insert({
      user_id: params.userId || null,
      action: params.action,
      resource: params.resource,
      target_type: params.resource,
      target_id: params.targetId || null,
      result: params.result,
      metadata: params.metadata || {},
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    });
  } catch {
    // Don't fail the request
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido" }, 405);
  }

  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";
  const userAgent = sanitizeShort(req.headers.get("user-agent"), 500);

  try {
    const body = await req.json();
    const formType = body.form_type as string;

    if (!formType || !["contact", "listing", "ombudsman", "career", "property_lead", "support"].includes(formType)) {
      return jsonResponse({ error: "Tipo de formulário inválido" }, 400);
    }

    // Rate limiting
    const rlKey = `${ipAddress}:${formType}`;
    if (isRateLimited(rlKey, formType)) {
      const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await auditLog(serviceClient, {
        action: "form_rate_limited",
        resource: "form",
        result: "rate_limited",
        metadata: { form_type: formType, ip: ipAddress },
        ipAddress,
        userAgent,
      });
      return jsonResponse({ error: "Muitas tentativas. Aguarde alguns minutos antes de enviar novamente." }, 429);
    }

    // Get authenticated user if available
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token && token !== SUPABASE_ANON_KEY) {
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ============================================================
    // CONTACT FORM
    // ============================================================
    if (formType === "contact") {
      const name = sanitizeShort(body.name, 100);
      const email = sanitizeShort(body.email, 255);
      const phone = sanitizeShort(body.phone, 20);
      const subject = sanitizeShort(body.subject, 100);
      const message = sanitize(body.message).slice(0, 2000);

      if (!name || name.length < 2) return jsonResponse({ error: "Nome é obrigatório (mínimo 2 caracteres)" }, 400);
      if (!validateEmail(email)) return jsonResponse({ error: "E-mail inválido" }, 400);
      if (phone && !validatePhone(phone)) return jsonResponse({ error: "Telefone inválido" }, 400);
      if (!message || message.length < 10) return jsonResponse({ error: "Mensagem é obrigatória (mínimo 10 caracteres)" }, 400);

      const { data, error } = await serviceClient.from("contact_messages").insert({
        name, email, phone: phone || null, subject: subject || null, message,
      }).select("id").single();

      if (error) {
        await auditLog(serviceClient, { userId, action: "form_submit_error", resource: "contact_messages", result: "error", metadata: { error: error.message }, ipAddress, userAgent });
        return jsonResponse({ error: "Erro ao enviar mensagem. Tente novamente." }, 500);
      }

      await auditLog(serviceClient, { userId, action: "form_submit", resource: "contact_messages", targetId: data.id, result: "success", metadata: { form_type: "contact" }, ipAddress, userAgent });
      return jsonResponse({ success: true, message: "Mensagem enviada com sucesso!" });
    }

    // ============================================================
    // LISTING SUBMISSION (Anuncie)
    // ============================================================
    if (formType === "listing") {
      const owner_name = sanitizeShort(body.owner_name, 100);
      const owner_phone = sanitizeShort(body.owner_phone, 20);
      const owner_email = sanitizeShort(body.owner_email, 255);
      const purpose = body.purpose === "sale" || body.purpose === "rent" ? body.purpose : null;
      const property_type = sanitizeShort(body.property_type, 50);
      const neighborhood = sanitizeShort(body.neighborhood, 100);
      const address = sanitizeShort(body.address, 200);
      const bedrooms = Math.max(0, Math.min(99, parseInt(body.bedrooms) || 0));
      const bathrooms = Math.max(0, Math.min(99, parseInt(body.bathrooms) || 0));
      const parking_spots = Math.max(0, Math.min(99, parseInt(body.parking_spots) || 0));
      const area = Math.max(0, Math.min(999999, parseFloat(body.area) || 0));
      const asking_price = Math.max(0, Math.min(999999999, parseFloat(body.asking_price) || 0));
      const description = sanitize(body.description).slice(0, 2000);

      if (!owner_name || owner_name.length < 2) return jsonResponse({ error: "Nome é obrigatório" }, 400);
      if (!validateEmail(owner_email)) return jsonResponse({ error: "E-mail inválido" }, 400);
      if (!owner_phone || !validatePhone(owner_phone)) return jsonResponse({ error: "Telefone é obrigatório" }, 400);

      const { data, error } = await serviceClient.from("listing_submissions").insert({
        owner_name, owner_phone, owner_email, purpose, property_type: property_type || null,
        neighborhood: neighborhood || null, address: address || null,
        bedrooms, bathrooms, parking_spots,
        area: area || null, asking_price: asking_price || null,
        description: description || null,
      }).select("id").single();

      if (error) {
        await auditLog(serviceClient, { userId, action: "form_submit_error", resource: "listing_submissions", result: "error", metadata: { error: error.message }, ipAddress, userAgent });
        return jsonResponse({ error: "Erro ao enviar. Tente novamente." }, 500);
      }

      await auditLog(serviceClient, { userId, action: "form_submit", resource: "listing_submissions", targetId: data.id, result: "success", metadata: { form_type: "listing" }, ipAddress, userAgent });
      return jsonResponse({ success: true, message: "Imóvel cadastrado para análise!" });
    }

    // ============================================================
    // OMBUDSMAN
    // ============================================================
    if (formType === "ombudsman") {
      const reporter_name = sanitizeShort(body.reporter_name, 100);
      const reporter_email = sanitizeShort(body.reporter_email, 255);
      const reporter_phone = sanitizeShort(body.reporter_phone, 20);
      const ticket_type = ["sugestao", "reclamacao", "elogio", "denuncia"].includes(body.ticket_type) ? body.ticket_type : null;
      const message = sanitize(body.message).slice(0, 5000);

      if (!reporter_name || reporter_name.length < 2) return jsonResponse({ error: "Nome é obrigatório" }, 400);
      if (!validateEmail(reporter_email)) return jsonResponse({ error: "E-mail inválido" }, 400);
      if (!ticket_type) return jsonResponse({ error: "Tipo de manifestação é obrigatório" }, 400);
      if (!message || message.length < 10) return jsonResponse({ error: "Mensagem é obrigatória (mínimo 10 caracteres)" }, 400);

      const { data, error } = await serviceClient.from("ombudsman_tickets").insert({
        reporter_name, reporter_email,
        reporter_phone: reporter_phone || null,
        ticket_type, message,
      }).select("id").single();

      if (error) {
        await auditLog(serviceClient, { userId, action: "form_submit_error", resource: "ombudsman_tickets", result: "error", metadata: { error: error.message }, ipAddress, userAgent });
        return jsonResponse({ error: "Erro ao enviar. Tente novamente." }, 500);
      }

      await auditLog(serviceClient, { userId, action: "form_submit", resource: "ombudsman_tickets", targetId: data.id, result: "success", metadata: { form_type: "ombudsman" }, ipAddress, userAgent });
      return jsonResponse({ success: true, message: "Manifestação recebida com sucesso!" });
    }

    // ============================================================
    // CAREER (Trabalhe Conosco)
    // ============================================================
    if (formType === "career") {
      const applicant_name = sanitizeShort(body.applicant_name, 100);
      const applicant_email = sanitizeShort(body.applicant_email, 255);
      const applicant_phone = sanitizeShort(body.applicant_phone, 20);
      const area_of_interest = sanitizeShort(body.area_of_interest, 50);
      const experience = sanitize(body.experience).slice(0, 3000);

      if (!applicant_name || applicant_name.length < 2) return jsonResponse({ error: "Nome é obrigatório" }, 400);
      if (!validateEmail(applicant_email)) return jsonResponse({ error: "E-mail inválido" }, 400);
      if (!applicant_phone || !validatePhone(applicant_phone)) return jsonResponse({ error: "Telefone é obrigatório" }, 400);
      if (!area_of_interest) return jsonResponse({ error: "Área de interesse é obrigatória" }, 400);

      const { data, error } = await serviceClient.from("job_applications").insert({
        applicant_name, applicant_email, applicant_phone,
        area_of_interest, experience: experience || null,
      }).select("id").single();

      if (error) {
        await auditLog(serviceClient, { userId, action: "form_submit_error", resource: "job_applications", result: "error", metadata: { error: error.message }, ipAddress, userAgent });
        return jsonResponse({ error: "Erro ao enviar. Tente novamente." }, 500);
      }

      await auditLog(serviceClient, { userId, action: "form_submit", resource: "job_applications", targetId: data.id, result: "success", metadata: { form_type: "career" }, ipAddress, userAgent });
      return jsonResponse({ success: true, message: "Currículo enviado com sucesso!" });
    }

    // ============================================================
    // PROPERTY LEAD (Interesse no imóvel)
    // ============================================================
    if (formType === "property_lead") {
      const name = sanitizeShort(body.name, 100);
      const email = sanitizeShort(body.email, 255);
      const phone = sanitizeShort(body.phone, 20);
      const message = sanitize(body.message).slice(0, 1000);
      const property_id = sanitizeShort(body.property_id, 36);

      if (!name || name.length < 2) return jsonResponse({ error: "Nome é obrigatório" }, 400);
      if (!validateEmail(email)) return jsonResponse({ error: "E-mail inválido" }, 400);

      const insertData: Record<string, unknown> = {
        name, email, phone: phone || null, message: message || null, source: "website",
      };
      // Only add property_id if it looks like a valid UUID
      if (property_id && /^[0-9a-f-]{36}$/i.test(property_id)) {
        insertData.property_id = property_id;
      }

      const { data, error } = await serviceClient.from("property_leads").insert(insertData).select("id").single();

      if (error) {
        await auditLog(serviceClient, { userId, action: "form_submit_error", resource: "property_leads", result: "error", metadata: { error: error.message }, ipAddress, userAgent });
        return jsonResponse({ error: "Erro ao enviar. Tente novamente." }, 500);
      }

      await auditLog(serviceClient, { userId, action: "form_submit", resource: "property_leads", targetId: data.id, result: "success", metadata: { form_type: "property_lead", property_id }, ipAddress, userAgent });
      return jsonResponse({ success: true, message: "Interesse registrado com sucesso!" });
    }

    // ============================================================
    // SUPPORT REQUEST (authenticated only)
    // ============================================================
    if (formType === "support") {
      if (!userId) {
        return jsonResponse({ error: "Autenticação necessária para abrir solicitação de suporte" }, 401);
      }

      const subject = sanitizeShort(body.subject, 200);
      const message = sanitize(body.message).slice(0, 5000);
      const category = ["manutencao", "financeiro", "contrato", "vistoria", "geral"].includes(body.category) ? body.category : null;
      const priority = ["low", "normal", "high", "urgent"].includes(body.priority) ? body.priority : "normal";

      if (!subject || subject.length < 3) return jsonResponse({ error: "Assunto é obrigatório" }, 400);
      if (!message || message.length < 10) return jsonResponse({ error: "Mensagem é obrigatória (mínimo 10 caracteres)" }, 400);
      if (!category) return jsonResponse({ error: "Categoria é obrigatória" }, 400);

      const { data, error } = await serviceClient.from("support_requests").insert({
        user_id: userId, subject, message, category, priority,
      }).select("id").single();

      if (error) {
        await auditLog(serviceClient, { userId, action: "form_submit_error", resource: "support_requests", result: "error", metadata: { error: error.message }, ipAddress, userAgent });
        return jsonResponse({ error: "Erro ao enviar. Tente novamente." }, 500);
      }

      await auditLog(serviceClient, { userId, action: "form_submit", resource: "support_requests", targetId: data.id, result: "success", metadata: { form_type: "support" }, ipAddress, userAgent });
      return jsonResponse({ success: true, message: "Solicitação aberta com sucesso!" });
    }

    return jsonResponse({ error: "Formulário não reconhecido" }, 400);
  } catch (err) {
    console.error("form-submit error:", err);
    return jsonResponse({ error: "Erro interno. Tente novamente." }, 500);
  }
});
