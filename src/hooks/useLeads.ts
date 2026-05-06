import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { AdminLead } from '@/types/admin';

export interface LeadFilters {
  funnel_stage?: string | string[];
  assigned_to?: string | null;
  temperature?: string;
  source?: string;
  channel?: string;
  search?: string;
  limit?: number;
}

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let q = supabase.from('property_leads').select('*').order('created_at', { ascending: false });

      if (filters.funnel_stage) {
        if (Array.isArray(filters.funnel_stage)) q = q.in('funnel_stage', filters.funnel_stage);
        else q = q.eq('funnel_stage', filters.funnel_stage);
      }
      if (filters.assigned_to === null) q = q.is('assigned_to', null);
      else if (filters.assigned_to) q = q.eq('assigned_to', filters.assigned_to);
      if (filters.temperature) q = q.eq('temperature', filters.temperature);
      if (filters.source) q = q.eq('source', filters.source);
      if (filters.channel) q = q.eq('channel', filters.channel);
      if (filters.search?.trim()) {
        const s = `%${filters.search.trim()}%`;
        q = q.or(`name.ilike.${s},email.ilike.${s},phone.ilike.${s},whatsapp.ilike.${s}`);
      }
      if (filters.limit) q = q.limit(filters.limit);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AdminLead[];
    },
  });
}

export function useLead(id?: string | null) {
  return useQuery({
    queryKey: ['lead', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('property_leads').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data as AdminLead | null;
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<AdminLead> }) => {
      const { data, error } = await supabase
        .from('property_leads')
        .update(patch as never)
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data as AdminLead | null;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead', vars.id] });
      toast({ title: 'Lead atualizado' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao atualizar', description: e?.message, variant: 'destructive' }),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AdminLead>) => {
      const { data, error } = await supabase
        .from('property_leads')
        .insert(payload as never)
        .select('id')
        .single();
      if (error) throw error;
      // Dispara distribuição automática (não bloqueia)
      if (data?.id) {
        supabase.functions
          .invoke('lead-distributor', { body: { action: 'distribute', lead_id: data.id } })
          .catch(() => {});
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead criado' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao criar lead', description: e?.message, variant: 'destructive' }),
  });
}
