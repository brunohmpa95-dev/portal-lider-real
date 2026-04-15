import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockBrokerLeads } from '@/data/mock-internal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  visiting: 'Visitando',
  proposal: 'Proposta',
  closed: 'Fechado',
};

export default function BrokerLeads() {
  return (
    <div>
      <InternalPageHeader title="Meus Leads" subtitle="Leads atribuídos à sua carteira" />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar lead..." className="pl-9 h-9" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Telefone</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Interesse</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Etapa</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockBrokerLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{lead.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.interest}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.stage} label={STAGE_LABELS[lead.stage]} /></td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
