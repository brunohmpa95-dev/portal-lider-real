import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { Users, Plus, TrendingUp } from 'lucide-react';
import { mockBrokers } from '@/data/mock-internal';

export default function AdminBrokers() {
  const active = mockBrokers.filter(b => b.status === 'active');
  const totalCommission = mockBrokers.reduce((s, b) => s + b.commission, 0);

  return (
    <div>
      <InternalPageHeader
        title="Corretores Parceiros"
        subtitle="Gestão de corretores parceiros e desempenho"
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" /> Novo Corretor
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Ativos" value={active.length} icon={Users} />
        <KPICard title="Total de leads" value={mockBrokers.reduce((s, b) => s + b.leads, 0)} icon={TrendingUp} />
        <KPICard title="Comissões acumuladas" value={`R$ ${totalCommission.toLocaleString('pt-BR')}`} icon={TrendingUp} />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">CRECI</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Região</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Leads</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockBrokers.map(b => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">{b.creci}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{b.region}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{b.leads}</td>
                  <td className="px-4 py-3 text-foreground font-medium hidden lg:table-cell">R$ {b.commission.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
