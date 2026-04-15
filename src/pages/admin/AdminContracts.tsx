import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { FileText, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CONTRACT_STATUS, getStatusLabel } from '@/types/status';

interface ContractRow {
  id: string;
  contract_number: string | null;
  contract_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  monthly_value: number | null;
  total_value: number | null;
  user_id: string | null;
  property_id: string | null;
}

export default function AdminContracts() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadContracts(); }, []);

  async function loadContracts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar contratos'); console.error(error); }
    setContracts(data || []);
    setLoading(false);
  }

  const filtered = contracts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.contract_number?.toLowerCase().includes(q) || c.contract_type.toLowerCase().includes(q));
  });

  const active = contracts.filter(c => c.status === 'active');
  const expired = contracts.filter(c => c.status === 'expired');

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Contratos" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Contratos" subtitle="Gestão de contratos de locação e venda" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Ativos" value={active.length} icon={FileText} />
        <KPICard title="Vencidos" value={expired.length} icon={FileText} description="precisam renovação" />
        <KPICard title="Total" value={contracts.length} icon={FileText} />
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar contrato..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum contrato encontrado" description="Contratos cadastrados aparecerão aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nº</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Vigência</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{c.contract_number || c.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.contract_type}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} label={getStatusLabel(CONTRACT_STATUS, c.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString('pt-BR') : '—'}
                      {c.end_date ? ` a ${new Date(c.end_date).toLocaleDateString('pt-BR')}` : ''}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium hidden lg:table-cell">
                      {c.monthly_value ? `R$ ${c.monthly_value.toLocaleString('pt-BR')}/mês` : c.total_value ? `R$ ${c.total_value.toLocaleString('pt-BR')}` : '—'}
                    </td>
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
