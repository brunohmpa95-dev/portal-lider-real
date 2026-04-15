import { useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockBrokerLeads } from '@/data/mock-internal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  visiting: 'Visitando',
  proposal: 'Proposta',
  closed: 'Fechado',
};

const STAGE_FILTERS = ['all', 'new', 'contacted', 'visiting', 'proposal'] as const;

export default function BrokerLeads() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = mockBrokerLeads.filter(l => {
    if (filter !== 'all' && l.stage !== filter) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <InternalPageHeader title="Meus Leads" subtitle={`${mockBrokerLeads.length} leads na sua carteira`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar lead..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STAGE_FILTERS.map(s => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(s)}
              className="h-8 text-xs"
            >
              {s === 'all' ? 'Todos' : STAGE_LABELS[s]}
            </Button>
          ))}
        </div>
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
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Último contato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{lead.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.interest}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.stage} label={STAGE_LABELS[lead.stage]} /></td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.source}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString('pt-BR') : 'Sem contato'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Nenhum lead encontrado</div>
        )}
      </div>
    </div>
  );
}
