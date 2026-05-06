import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns the list of permission codes the current user has.
 * Cached for 5 minutes — invalidate after role changes if needed.
 */
export function usePermissions() {
  return useQuery({
    queryKey: ['my-permissions'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.rpc('get_my_permissions');
      if (error) {
        console.error('Failed to load permissions', error);
        return [];
      }
      return (data as string[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Convenience hook: returns true if the user has the given permission code.
 */
export function useHasPermission(code: string): boolean {
  const { data } = usePermissions();
  return (data || []).includes(code);
}

/**
 * Returns true if the user has at least one of the given codes.
 */
export function useHasAnyPermission(codes: string[]): boolean {
  const { data } = usePermissions();
  if (!data) return false;
  return codes.some((c) => data.includes(c));
}
