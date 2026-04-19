import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  normalized: string;
  region: string | null;
  is_active: boolean;
  verified: boolean;
  source: string | null;
}

/**
 * Hook for fetching neighborhoods from the database.
 * Replaces the legacy hardcoded NEIGHBORHOODS constant.
 *
 * @param options.activeOnly - if true (default), filters out inactive ones (use for public site)
 * @param options.includeAll - if true, returns active+inactive (admin CRUD)
 */
export function useNeighborhoods(options: { includeAll?: boolean } = {}) {
  return useQuery({
    queryKey: ['neighborhoods', options.includeAll ? 'all' : 'active'],
    queryFn: async (): Promise<Neighborhood[]> => {
      let query = supabase.from('neighborhoods').select('*').order('name');
      if (!options.includeAll) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Neighborhood[];
    },
    staleTime: 1000 * 60 * 10, // 10 min — bairros mudam raramente
  });
}

/** Returns just the names (for dropdowns/selects backwards compatibility). */
export function useNeighborhoodNames() {
  const { data, ...rest } = useNeighborhoods();
  return { data: data?.map((n) => n.name) ?? [], ...rest };
}
