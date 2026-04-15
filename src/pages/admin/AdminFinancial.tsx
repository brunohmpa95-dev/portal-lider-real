import { DollarSign } from 'lucide-react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockCommissions } from '@/data/mock-internal';

export default function AdminFinancial() {
  const paid = mockCommissions.filter(c => c.status === 'paid');
  const pending = mockCommissions.filter(c => c.status === 'pending');

  return (
    <div>
      <InternalPageHeader title="Financeiro" subtitle="Títulos, inadimplência e repasses" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Recebido" value={`R$ ${paid.reduce((s, c) => s + c.amount, 0).toLocaleString('pt-BR')}`} icon={DollarSign} />
        <KPICard title="Pendente" value={`R$ ${pending.reduce((s, c) => s + c.amount, 0).toLocaleString('pt-BR')}`} icon={DollarSign} />
        <KPICard title="Inadimplência" value="0%" icon={DollarSign} description="neste mês" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Corretor</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Imóvel</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Valor</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockCommissions.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.broker}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.property}</td>
                  <td className="px-4 py-3 text-foreground font-medium">R$ {c.amount.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
