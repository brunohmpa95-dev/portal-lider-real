import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VISIT_STATUS, getStatusLabel } from '@/types/status';

export default function BrokerVisits() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadVisits(); }, [user]);

  async function loadVisits() {
    setLoading(true);
    const { data } = await supabase
      .from('visits')
      .select('id, scheduled_at, status, notes, property_id, lead_id')
      .eq('agent_id', user!.id)
      .order('scheduled_at', { ascending: false });
    setVisits(data || []);
    setLoading(false);
  }

  const scheduled = visits.filter(v => v.status === 'scheduled');
  const completed = visits.filter(v => v.status === 'completed');

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Visitas" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Visitas" subtitle="Acompanhe suas visitas agendadas e realizadas" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <KPICard title="Agendadas" value={scheduled.length} icon={CalendarDays} description="próximas visitas" />
        <KPICard title="Realizadas" value={completed.length} icon={CalendarDays} description="total" />
      </div>

      {visits.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nenhuma visita" description="Suas visitas agendadas aparecerão aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Data/Hora</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visits.map(v => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground">
                      {new Date(v.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} label={getStatusLabel(VISIT_STATUS, v.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">{v.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
