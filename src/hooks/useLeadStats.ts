import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type StatsPeriod = 7 | 30 | 90;

export interface LeadStats {
  total: number;
  byStage: Record<string, number>;
  conversionRate: number;
  lostRate: number;
  avgDaysToClose: number | null;
  topLostReasons: { name: string; count: number }[];
}

const STAGE_ORDER = ['new', 'contact', 'visit', 'proposal', 'negotiation', 'closed', 'lost'];

export function useLeadStats(period: StatsPeriod = 30) {
  return useQuery({
    queryKey: ['leadStats', period],
    queryFn: async (): Promise<LeadStats> => {
      const since = new Date();
      since.setDate(since.getDate() - period);

      const { data: leads } = await supabase
        .from('property_leads')
        .select('id, funnel_stage, created_at, updated_at, lost_reason_id, lost_at')
        .gte('created_at', since.toISOString());

      const all = leads ?? [];
      const total = all.length;
      const byStage: Record<string, number> = {};
      STAGE_ORDER.forEach((s) => (byStage[s] = 0));
      all.forEach((l: any) => {
        const s = l.funnel_stage || 'new';
        byStage[s] = (byStage[s] || 0) + 1;
      });

      const closed = byStage['closed'] || 0;
      const lost = byStage['lost'] || 0;
      const considered = total - lost;
      const conversionRate = considered > 0 ? (closed / considered) * 100 : 0;
      const lostRate = total > 0 ? (lost / total) * 100 : 0;

      // avg days to close
      const closedLeads = all.filter((l: any) => l.funnel_stage === 'closed');
      const avgDaysToClose =
        closedLeads.length > 0
          ? closedLeads.reduce((sum: number, l: any) => {
              const days = (new Date(l.updated_at).getTime() - new Date(l.created_at).getTime()) / 86400000;
              return sum + days;
            }, 0) / closedLeads.length
          : null;

      // top lost reasons
      const lostWithReason = all.filter((l: any) => l.lost_reason_id);
      const reasonIds = [...new Set(lostWithReason.map((l: any) => l.lost_reason_id))];
      let topLostReasons: { name: string; count: number }[] = [];
      if (reasonIds.length > 0) {
        const { data: reasons } = await supabase
          .from('lead_lost_reasons' as any)
          .select('id, name')
          .in('id', reasonIds);
        const nameMap = new Map<string, string>((reasons || []).map((r: any) => [r.id, r.name]));
        const counts: Record<string, number> = {};
        lostWithReason.forEach((l: any) => {
          const name = nameMap.get(l.lost_reason_id) || 'Outro';
          counts[name] = (counts[name] || 0) + 1;
        });
        topLostReasons = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }

      return { total, byStage, conversionRate, lostRate, avgDaysToClose, topLostReasons };
    },
    staleTime: 1000 * 60 * 5,
  });
}
