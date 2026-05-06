import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DistributionRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  priority: number;
  mode: 'round_robin' | 'manual_suggest' | 'property_owner' | 'region';
  match_sources: string[];
  match_neighborhoods: string[];
  match_property_types: string[];
  match_purposes: string[];
  min_price: number | null;
  max_price: number | null;
  eligible_user_ids: string[];
  create_task: boolean;
  notify_assignee: boolean;
  created_at: string;
  updated_at: string;
}

export function useDistributionRules() {
  const [rules, setRules] = useState<DistributionRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lead_distribution_rules' as any)
      .select('*')
      .order('priority', { ascending: true });
    setRules((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upsert = async (rule: Partial<DistributionRule>) => {
    const { data, error } = await supabase
      .from('lead_distribution_rules' as any)
      .upsert(rule as any)
      .select()
      .single();
    if (!error) await load();
    return { data, error };
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from('lead_distribution_rules' as any)
      .delete()
      .eq('id', id);
    if (!error) await load();
    return { error };
  };

  const toggle = async (id: string, is_active: boolean) => {
    await supabase
      .from('lead_distribution_rules' as any)
      .update({ is_active })
      .eq('id', id);
    await load();
  };

  return { rules, loading, reload: load, upsert, remove, toggle };
}
