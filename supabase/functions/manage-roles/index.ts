import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.49.4/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user's token for auth verification
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service role client for role operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET: check own roles
    if (req.method === "GET" && action === "my-roles") {
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ roles: roles?.map((r: any) => r.role) || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET: check permission
    if (req.method === "GET" && action === "check-role") {
      const role = url.searchParams.get("role");
      if (!role) {
        return new Response(
          JSON.stringify({ error: "Parâmetro 'role' obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: hasRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", role)
        .maybeSingle();

      return new Response(
        JSON.stringify({ hasRole: !!hasRole }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST: assign role (superadmin only)
    if (req.method === "POST" && action === "assign-role") {
      // Verify caller is superadmin
      const { data: callerRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "superadmin")
        .maybeSingle();

      if (!callerRole) {
        return new Response(
          JSON.stringify({ error: "Acesso negado" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const targetUserId = body.user_id;
      const targetRole = body.role;

      if (!targetUserId || !targetRole) {
        return new Response(
          JSON.stringify({ error: "user_id e role são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate role value
      const validRoles = ["cliente", "corretor", "locacao", "vendas", "financeiro", "administrativo", "superadmin"];
      if (!validRoles.includes(targetRole)) {
        return new Response(
          JSON.stringify({ error: "Perfil inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: targetUserId,
          role: targetRole,
          granted_by: user.id,
        });

      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Erro ao atribuir perfil" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Audit log
      await supabaseAdmin.from("audit_log").insert({
        user_id: user.id,
        action: "role_assigned",
        target_type: "user",
        target_id: targetUserId,
        metadata: { role: targetRole },
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE: remove role (superadmin only)
    if (req.method === "DELETE" && action === "remove-role") {
      const { data: callerRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "superadmin")
        .maybeSingle();

      if (!callerRole) {
        return new Response(
          JSON.stringify({ error: "Acesso negado" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const targetUserId = body.user_id;
      const targetRole = body.role;

      if (!targetUserId || !targetRole) {
        return new Response(
          JSON.stringify({ error: "user_id e role são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", targetRole);

      // Audit log
      await supabaseAdmin.from("audit_log").insert({
        user_id: user.id,
        action: "role_removed",
        target_type: "user",
        target_id: targetUserId,
        metadata: { role: targetRole },
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação não reconhecida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
