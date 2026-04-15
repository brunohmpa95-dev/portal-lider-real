import { DollarSign } from 'lucide-react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import { mockCommissions } from '@/data/mock-internal';

export default function BrokerCommissions() {
  const paid = mockCommissions.filter(c => c.status === 'paid');
  const pending = mockCommissions.filter(c => c.status === 'pending');
  const totalPaid = paid.reduce((s, c) => s + c.amount, 0);
  const totalPending = pending.reduce((s, c) => s + c.amount, 0);

  return (
    <div>
      <InternalPageHeader title="Comissões" subtitle="Acompanhe suas comissões previstas e recebidas" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <KPICard title="Recebidas" value={`R$ ${totalPaid.toLocaleString('pt-BR')}`} icon={DollarSign} description={`${paid.length} comissões pagas`} />
        <KPICard title="Pendentes" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} icon={DollarSign} description={`${pending.length} a receber`} />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Imóvel</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Valor</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Vencimento / Pgto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockCommissions.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.property}</td>
                  <td className="px-4 py-3 text-foreground font-medium">R$ {c.amount.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {c.paidAt ? new Date(c.paidAt).toLocaleDateString('pt-BR') : c.dueDate ? new Date(c.dueDate).toLocaleDateString('pt-BR') : '—'}
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
