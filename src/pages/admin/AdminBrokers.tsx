import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { Users, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrokerRow {
  id: string;
  creci: string | null;
  region: string | null;
  status: string;
  commission_pct: number | null;
  profiles?: { full_name: string | null; phone: string | null } | null;
}

export default function AdminBrokers() {
  const [brokers, setBrokers] = useState<BrokerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBrokers(); }, []);

  async function loadBrokers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('brokers')
      .select('id, creci, region, status, commission_pct, profiles(full_name, phone)')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar corretores'); console.error(error); }
    setBrokers((data as any[]) || []);
    setLoading(false);
  }

  const active = brokers.filter(b => b.status === 'active');

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Corretores Parceiros" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Corretores Parceiros" subtitle="Gestão de corretores parceiros e desempenho" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Ativos" value={active.length} icon={Users} />
        <KPICard title="Total" value={brokers.length} icon={TrendingUp} />
      </div>

      {brokers.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum corretor cadastrado" description="Cadastre corretores parceiros para vê-los aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">CRECI</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Região</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Comissão %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brokers.map(b => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{b.profiles?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">{b.creci || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{b.region || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-foreground font-medium hidden lg:table-cell">{b.commission_pct != null ? `${b.commission_pct}%` : '—'}</td>
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
