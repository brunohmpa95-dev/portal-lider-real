import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LEAD_STATUS, getStatusLabel } from '@/types/status';

const STAGE_FILTERS = ['all', 'new', 'contact', 'visit', 'proposal', 'negotiation'] as const;

export default function BrokerLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { if (user) loadLeads(); }, [user]);

  async function loadLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('property_leads')
      .select('id, name, email, phone, funnel_stage, source, created_at, updated_at')
      .eq('assigned_to', user!.id)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setLeads(data || []);
    setLoading(false);
  }

  const filtered = leads.filter(l => {
    if (filter !== 'all' && l.funnel_stage !== filter) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Meus Leads" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Meus Leads" subtitle={`${leads.length} leads na sua carteira`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar lead..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STAGE_FILTERS.map(s => (
            <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="h-8 text-xs">
              {s === 'all' ? 'Todos' : getStatusLabel(LEAD_STATUS, s)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum lead encontrado" description={leads.length === 0 ? 'Quando leads forem atribuídos a você, eles aparecerão aqui.' : 'Tente ajustar os filtros.'} />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Telefone</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Etapa</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Origem</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Criado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{lead.phone || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.funnel_stage} label={getStatusLabel(LEAD_STATUS, lead.funnel_stage)} /></td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.source || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
