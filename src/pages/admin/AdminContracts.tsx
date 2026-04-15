import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockContracts } from '@/data/mock-internal';

export default function AdminContracts() {
  return (
    <div>
      <InternalPageHeader title="Contratos" subtitle="Gestão de contratos de locação e venda" />

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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockContracts.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{c.number}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.type}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.client}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.property}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—'}
                    {c.endDate ? ` a ${new Date(c.endDate).toLocaleDateString('pt-BR')}` : ''}
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
