// Lead automation runner: lê fila lead_automation_queue,
// casa com lead_automation_rules e executa ações.
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

interface QueueItem {
  id: string;
  lead_id: string;
  event_type: string;
  from_stage: string | null;
  to_stage: string | null;
  payload: Record<string, any>;
  attempts: number;
}

interface AutomationRule {
  id: string;
  name: string;
  is_active: boolean;
  trigger_event: string;
  trigger_from_stage: string | null;
  trigger_to_stage: string | null;
  action_type: string;
  action_config: Record<string, any>;
}

function ruleMatches(rule: AutomationRule, item: QueueItem): boolean {
  if (!rule.is_active) return false;
  if (rule.trigger_event !== item.event_type) return false;
  if (rule.trigger_from_stage && rule.trigger_from_stage !== item.from_stage) return false;
  if (rule.trigger_to_stage && rule.trigger_to_stage !== item.to_stage) return false;
  return true;
}

function interpolate(tpl: string, lead: any): string {
  return (tpl || "")
    .replace(/\{\{name\}\}/g, lead?.name ?? "")
    .replace(/\{\{stage\}\}/g, lead?.funnel_stage ?? "")
    .replace(/\{\{source\}\}/g, lead?.source ?? "");
}

async function executeAction(rule: AutomationRule, item: QueueItem) {
  const { data: lead } = await admin
    .from("property_leads")
    .select("id, name, assigned_to, funnel_stage, source, tags, priority")
    .eq("id", item.lead_id)
    .single();
  if (!lead) return;

  const cfg = rule.action_config || {};
  const target =
    cfg.target_user_id ||
    (cfg.target === "assignee" ? lead.assigned_to : null);

  switch (rule.action_type) {
    case "create_task": {
      if (!target) break;
      await admin.from("tasks").insert({
        title: interpolate(cfg.title || `Tarefa: ${rule.name}`, lead),
        description: interpolate(cfg.description || "", lead),
        assigned_to: target,
        priority: cfg.priority || "normal",
        status: "pending",
        lead_id: item.lead_id,
        due_at: cfg.due_in_hours
          ? new Date(Date.now() + cfg.due_in_hours * 3600 * 1000).toISOString()
          : null,
      });
      break;
    }
    case "notify_user": {
      if (!target) break;
      await admin.from("notifications").insert({
        user_id: target,
        title: interpolate(cfg.title || rule.name, lead),
        message: interpolate(cfg.message || "", lead),
        type: "lead",
        link: `/admin/leads/${item.lead_id}`,
      });
      break;
    }
    case "add_tag": {
      const newTag = cfg.tag;
      if (!newTag) break;
      const tags = Array.isArray(lead.tags) ? lead.tags : [];
      if (!tags.includes(newTag)) {
        await admin
          .from("property_leads")
          .update({ tags: [...tags, newTag] })
          .eq("id", item.lead_id);
      }
      break;
    }
    case "set_priority": {
      if (!cfg.priority) break;
      await admin
        .from("property_leads")
        .update({ priority: cfg.priority })
        .eq("id", item.lead_id);
      break;
    }
  }

  await admin.from("lead_distribution_logs").insert({
    lead_id: item.lead_id,
    action: "automation",
    reason: `Automação "${rule.name}" → ${rule.action_type}`,
    metadata: { rule_id: rule.id, event: item.event_type },
  });
}

async function processQueue(limit = 50) {
  const { data: items } = await admin
    .from("lead_automation_queue")
    .select("*")
    .is("processed_at", null)
    .lt("attempts", 3)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (!items || items.length === 0) return { processed: 0 };

  const { data: rules } = await admin
    .from("lead_automation_rules")
    .select("*")
    .eq("is_active", true);

  let processed = 0;
  for (const item of items as QueueItem[]) {
    try {
      for (const rule of (rules as AutomationRule[]) || []) {
        if (ruleMatches(rule, item)) {
          await executeAction(rule, item);
        }
      }
      await admin
        .from("lead_automation_queue")
        .update({ processed_at: new Date().toISOString() })
        .eq("id", item.id);
      processed++;
    } catch (e) {
      await admin
        .from("lead_automation_queue")
        .update({
          attempts: item.attempts + 1,
          last_error: (e as Error).message,
        })
        .eq("id", item.id);
    }
  }
  return { processed, scanned: items.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const result = await processQueue(100);
    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("automation-runner error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
