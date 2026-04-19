import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LostReason {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export function useLostReasons() {
  return useQuery({
    queryKey: ['lead_lost_reasons'],
    queryFn: async (): Promise<LostReason[]> => {
      const { data, error } = await supabase
        .from('lead_lost_reasons' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data as any) ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}
