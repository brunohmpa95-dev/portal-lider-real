// Lead distributor: distribui leads novos, checa SLA, redistribui leads vencidos.
// Pode ser chamado manualmente (action=distribute|check_sla|redistribute)
// ou via cron (sem body) — roda check_sla automaticamente.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function distributeLead(leadId: string) {
  const { data, error } = await admin.rpc("apply_distribution_rules", {
    _lead_id: leadId,
  });
  if (error) throw error;
  return data;
}

async function notifyAssignee(userId: string, leadId: string, leadName: string) {
  await admin.from("notifications").insert({
    user_id: userId,
    title: "Novo lead atribuído",
    message: `Lead ${leadName} foi atribuído a você. Atenda em até 15min.`,
    type: "lead",
    link: `/admin/leads/${leadId}`,
  });
}

async function createSlaTask(userId: string, leadId: string, leadName: string) {
  await admin.from("tasks").insert({
    title: `URGENTE: contatar lead ${leadName}`,
    description: `SLA de 15min violado. Contato imediato necessário.`,
    assigned_to: userId,
    priority: "urgent",
    due_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    related_lead_id: leadId,
    status: "todo",
  }).then(() => null).catch(() => null); // tasks table pode não ter related_lead_id, ignora erro
}

async function checkSLA() {
  const now = Date.now();
  // Leads atribuídos sem primeira resposta há mais de 15min
  const { data: cfg } = await admin
    .from("lead_sla_config")
    .select("*")
    .eq("is_active", true)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  const slaMin = cfg?.first_response_minutes ?? 15;
  const warnMin = cfg?.warning_minutes ?? 10;
  const actions: string[] = cfg?.on_breach_actions ?? [
    "notify",
    "task",
    "redistribute",
  ];

  const cutoffBreach = new Date(now - slaMin * 60 * 1000).toISOString();
  const cutoffWarn = new Date(now - warnMin * 60 * 1000).toISOString();

  // Buscar leads com SLA em risco
  const { data: leads, error } = await admin
    .from("property_leads")
    .select(
      "id, name, assigned_to, distributed_at, first_response_at, sla_status, redistribution_count",
    )
    .is("first_response_at", null)
    .not("assigned_to", "is", null)
    .not("distributed_at", "is", null)
    .lt("distributed_at", cutoffWarn);

  if (error) throw error;

  const results: any[] = [];

  for (const lead of leads ?? []) {
    const distributedAt = new Date(lead.distributed_at!).getTime();
    const isBreached = distributedAt < new Date(cutoffBreach).getTime();

    if (isBreached && lead.sla_status !== "breached") {
      // Marca como breached
      await admin
        .from("property_leads")
        .update({ sla_status: "breached" })
        .eq("id", lead.id);

      await admin.from("lead_sla_events").insert({
        lead_id: lead.id,
        event_type: "breached",
        sla_config_id: cfg?.id ?? null,
        metadata: { distributed_at: lead.distributed_at },
      });

      // Ações configuradas
      if (actions.includes("notify") && lead.assigned_to) {
        await notifyAssignee(lead.assigned_to, lead.id, lead.name);
      }
      if (actions.includes("task") && lead.assigned_to) {
        await createSlaTask(lead.assigned_to, lead.id, lead.name);
      }
      if (actions.includes("redistribute") && lead.redistribution_count < 3) {
        await admin.rpc("redistribute_lead", {
          _lead_id: lead.id,
          _reason: "sla_breach",
        });
      }

      results.push({ lead_id: lead.id, action: "breached" });
    } else if (!isBreached && lead.sla_status === "on_time") {
      // Em warning
      await admin
        .from("property_leads")
        .update({ sla_status: "warning" })
        .eq("id", lead.id);
      await admin.from("lead_sla_events").insert({
        lead_id: lead.id,
        event_type: "warning",
        sla_config_id: cfg?.id ?? null,
      });
      results.push({ lead_id: lead.id, action: "warning" });
    }
  }

  return { processed: leads?.length ?? 0, results };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body: any = {};
    if (req.method !== "GET") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    const action = body.action ?? "check_sla";

    let result: any;
    if (action === "distribute" && body.lead_id) {
      const assignedTo = await distributeLead(body.lead_id);
      // Notifica
      if (assignedTo) {
        const { data: lead } = await admin
          .from("property_leads")
          .select("name")
          .eq("id", body.lead_id)
          .single();
        await notifyAssignee(assignedTo, body.lead_id, lead?.name ?? "Lead");
      }
      result = { assigned_to: assignedTo };
    } else if (action === "redistribute" && body.lead_id) {
      const { data, error } = await admin.rpc("redistribute_lead", {
        _lead_id: body.lead_id,
        _reason: body.reason ?? "manual",
      });
      if (error) throw error;
      result = { assigned_to: data };
    } else {
      result = await checkSLA();
    }

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lead-distributor error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
