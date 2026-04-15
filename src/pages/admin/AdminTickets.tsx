import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockTickets } from '@/data/mock-internal';

const PRIORITY_LABELS: Record<string, string> = { high: 'Alta', normal: 'Normal', low: 'Baixa' };

export default function AdminTickets() {
  return (
    <div>
      <InternalPageHeader title="Chamados" subtitle="Fila de atendimento e suporte" />

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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockTickets.map(t => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{t.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{t.client}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.priority} label={PRIORITY_LABELS[t.priority]} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
