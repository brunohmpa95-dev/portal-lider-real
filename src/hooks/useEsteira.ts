import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DistributionLog {
  id: string;
  lead_id: string;
  rule_id: string | null;
  assigned_user_id: string | null;
  previous_user_id: string | null;
  action: string;
  reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export function useDistributionLogs(leadId?: string, limit = 50) {
  const [logs, setLogs] = useState<DistributionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('lead_distribution_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (leadId) q = q.eq('lead_id', leadId);
    const { data } = await q;
    setLogs((data as any) || []);
    setLoading(false);
  }, [leadId, limit]);

  useEffect(() => { load(); }, [load]);

  return { logs, loading, reload: load };
}

export interface SlaConfig {
  id: string;
  name: string;
  is_active: boolean;
  match_sources: string[];
  match_purposes: string[];
  first_response_minutes: number;
  warning_minutes: number;
  no_interaction_hours: number;
  on_breach_actions: string[];
}

export function useSlaConfig() {
  const [configs, setConfigs] = useState<SlaConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lead_sla_config' as any)
      .select('*')
      .order('created_at');
    setConfigs((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upsert = async (cfg: Partial<SlaConfig>) => {
    const { error } = await supabase
      .from('lead_sla_config' as any)
      .upsert(cfg as any);
    if (!error) await load();
    return { error };
  };

  return { configs, loading, reload: load, upsert };
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_event: string;
  trigger_from_stage: string | null;
  trigger_to_stage: string | null;
  action_type: string;
  action_config: Record<string, any>;
  created_at: string;
}

export function useAutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lead_automation_rules' as any)
      .select('*')
      .order('created_at', { ascending: false });
    setRules((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upsert = async (rule: Partial<AutomationRule>) => {
    const { error } = await supabase
      .from('lead_automation_rules' as any)
      .upsert(rule as any);
    if (!error) await load();
    return { error };
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from('lead_automation_rules' as any)
      .delete()
      .eq('id', id);
    if (!error) await load();
    return { error };
  };

  const toggle = async (id: string, is_active: boolean) => {
    await supabase
      .from('lead_automation_rules' as any)
      .update({ is_active })
      .eq('id', id);
    await load();
  };

  return { rules, loading, reload: load, upsert, remove, toggle };
}

/** Stats da esteira: leads distribuídos, tempo médio de resposta, taxa de atendimento (últimos 30d) */
export function useEsteiraStats() {
  const [stats, setStats] = useState({
    total: 0,
    distributed: 0,
    answered: 0,
    breached: 0,
    avgResponseMin: 0,
    answerRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('property_leads')
        .select('distributed_at, first_response_at, sla_status')
        .gte('created_at', since);
      const total = data?.length || 0;
      const distributed = data?.filter((l: any) => l.distributed_at).length || 0;
      const answered = data?.filter((l: any) => l.first_response_at).length || 0;
      const breached = data?.filter((l: any) => l.sla_status === 'breached').length || 0;
      const respTimes = (data || [])
        .filter((l: any) => l.distributed_at && l.first_response_at)
        .map((l: any) => (new Date(l.first_response_at).getTime() - new Date(l.distributed_at).getTime()) / 60000);
      const avgResponseMin = respTimes.length
        ? Math.round(respTimes.reduce((a, b) => a + b, 0) / respTimes.length)
        : 0;
      const answerRate = distributed ? Math.round((answered / distributed) * 100) : 0;
      setStats({ total, distributed, answered, breached, avgResponseMin, answerRate });
      setLoading(false);
    })();
  }, []);

  return { stats, loading };
}

// ===================== LEADS AT RISK (realtime) =====================
export interface LeadAtRisk {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  funnel_stage: string;
  assigned_to: string | null;
  distributed_at: string | null;
  first_response_at: string | null;
  last_interaction_at: string | null;
  sla_status: string;
  created_at: string;
  redistribution_count: number;
}

export function useLeadsAtRisk() {
  const [leads, setLeads] = useState<LeadAtRisk[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // últimos 7 dias com algum risco ou sem atribuição
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('property_leads')
      .select('id,name,email,phone,source,funnel_stage,assigned_to,distributed_at,first_response_at,last_interaction_at,sla_status,created_at,redistribution_count')
      .gte('created_at', since)
      .neq('funnel_stage', 'closed')
      .neq('funnel_stage', 'lost')
      .order('created_at', { ascending: false })
      .limit(200);
    setLeads((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('esteira-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_leads' }, () => {
        load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  // Categoriza
  const categorized = {
    unassigned: leads.filter(l => !l.assigned_to),
    breached: leads.filter(l => l.sla_status === 'breached' && !l.first_response_at),
    warning: leads.filter(l => l.sla_status === 'warning' && !l.first_response_at),
    stale: leads.filter(l => {
      if (!l.last_interaction_at) return false;
      const ageH = (Date.now() - new Date(l.last_interaction_at).getTime()) / 3600000;
      return ageH > 24 && l.first_response_at && !['closed','lost'].includes(l.funnel_stage);
    }),
  };

  return { leads, categorized, loading, reload: load };
}
