import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockBrokerVisits } from '@/data/mock-internal';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';
import KPICard from '@/components/shared/KPICard';

export default function BrokerVisits() {
  const scheduled = mockBrokerVisits.filter(v => v.status === 'scheduled');
  const completed = mockBrokerVisits.filter(v => v.status === 'completed');

  return (
    <div>
      <InternalPageHeader
        title="Visitas"
        subtitle="Acompanhe suas visitas agendadas e realizadas"
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" /> Agendar
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <KPICard title="Agendadas" value={scheduled.length} icon={CalendarDays} description="próximas visitas" />
        <KPICard title="Realizadas" value={completed.length} icon={CalendarDays} description="este mês" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Imóvel</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Data/Hora</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockBrokerVisits.map(v => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-foreground">{v.property}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.client}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(v.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">
                    {v.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
