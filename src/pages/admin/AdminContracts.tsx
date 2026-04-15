import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search } from 'lucide-react';
import { mockContracts } from '@/data/mock-internal';

export default function AdminContracts() {
  const active = mockContracts.filter(c => c.status === 'active');
  const expired = mockContracts.filter(c => c.status === 'expired');

  return (
    <div>
      <InternalPageHeader
        title="Contratos"
        subtitle="Gestão de contratos de locação e venda"
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" /> Novo Contrato
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Ativos" value={active.length} icon={FileText} />
        <KPICard title="Vencidos" value={expired.length} icon={FileText} description="precisam renovação" />
        <KPICard title="Total" value={mockContracts.length} icon={FileText} />
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar contrato..." className="pl-9 h-9" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nº</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Imóvel</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Vigência</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockContracts.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{c.number}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.type}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.client}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.property}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—'}
                    {c.endDate ? ` a ${new Date(c.endDate).toLocaleDateString('pt-BR')}` : ''}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium hidden lg:table-cell">
                    {c.monthlyValue ? `R$ ${c.monthlyValue.toLocaleString('pt-BR')}/mês` : '—'}
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
