import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import { Headphones, AlertTriangle } from 'lucide-react';
import { mockTickets } from '@/data/mock-internal';

const PRIORITY_LABELS: Record<string, string> = { high: 'Alta', normal: 'Normal', low: 'Baixa' };

export default function AdminTickets() {
  const openCount = mockTickets.filter(t => t.status === 'open').length;
  const inProgress = mockTickets.filter(t => t.status === 'in_progress').length;
  const highPriority = mockTickets.filter(t => t.priority === 'high').length;

  return (
    <div>
      <InternalPageHeader title="Chamados" subtitle="Fila de atendimento e suporte ao cliente" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Abertos" value={openCount} icon={Headphones} />
        <KPICard title="Em andamento" value={inProgress} icon={Headphones} />
        <KPICard title="Alta prioridade" value={highPriority} icon={AlertTriangle} description="requer atenção" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Assunto</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Cliente</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Prioridade</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockTickets.map(t => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-foreground">{t.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{t.client}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={t.priority === 'high' ? 'overdue' : t.priority === 'low' ? 'inactive' : 'pending'}
                      label={PRIORITY_LABELS[t.priority]}
                    />
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
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
