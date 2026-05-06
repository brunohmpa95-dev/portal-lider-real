import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  status: 'pending' | 'done' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to: string | null;
  created_by: string | null;
  lead_id: string | null;
  client_profile_id: string | null;
  property_id: string | null;
  contract_id: string | null;
  completed_at: string | null;
  appointment_type: 'visit' | 'meeting' | 'call' | 'whatsapp' | 'followup' | null;
  created_at: string;
  updated_at: string;
}

export const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
  visit: 'Visita',
  meeting: 'Reunião',
  call: 'Ligação',
  whatsapp: 'WhatsApp',
  followup: 'Retorno',
};

export type TaskFilter = 'all' | 'mine' | 'team' | 'overdue' | 'today' | 'week' | 'done';

export function useTasks(opts: { filter?: TaskFilter; leadId?: string } = {}) {
  const { user } = useAuth();
  const { filter = 'all', leadId } = opts;

  return useQuery({
    queryKey: ['tasks', filter, leadId, user?.id],
    queryFn: async (): Promise<Task[]> => {
      let q = supabase.from('tasks' as any).select('*').order('due_at', { ascending: true, nullsFirst: false });
      if (leadId) q = q.eq('lead_id', leadId);

      const now = new Date();
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      const endWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

      if (filter === 'mine' && user) q = q.eq('assigned_to', user.id).neq('status', 'done');
      else if (filter === 'overdue') q = q.lt('due_at', now.toISOString()).eq('status', 'pending');
      else if (filter === 'today') q = q.gte('due_at', startToday).lt('due_at', endToday).eq('status', 'pending');
      else if (filter === 'week') q = q.gte('due_at', startToday).lt('due_at', endWeek).eq('status', 'pending');
      else if (filter === 'done') q = q.eq('status', 'done');
      else if (filter === 'team') q = q.eq('status', 'pending');

      const { data, error } = await q;
      if (error) throw error;
      return (data as any) ?? [];
    },
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const create = useMutation({
    mutationFn: async (input: Partial<Task>) => {
      const payload: any = {
        ...input,
        created_by: user?.id ?? null,
        assigned_to: input.assigned_to ?? user?.id ?? null,
      };
      const { data, error } = await supabase.from('tasks' as any).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase.from('tasks' as any).update(patch as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return { create, update, remove };
}
