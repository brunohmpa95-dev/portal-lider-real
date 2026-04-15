import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockProposals } from '@/data/mock-internal';

export default function BrokerProposals() {
  return (
    <div>
      <InternalPageHeader title="Propostas" subtitle="Propostas enviadas e recebidas" />

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Imóvel</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Cliente</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Valor</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockProposals.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{p.property}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.client}</td>
                  <td className="px-4 py-3 text-foreground font-medium">R$ {p.amount.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
