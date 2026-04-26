import { useEffect, useState } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CONTRACT_STATUS, getStatusLabel } from '@/types/status';

export default function ClientContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadContracts(); }, [user]);

  async function loadContracts() {
    setLoading(true);
    const { data } = await supabase
      .from('contracts')
      .select('id, contract_number, contract_type, status, start_date, end_date, monthly_value, total_value')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setContracts(data || []);
    setLoading(false);
  }

  const active = contracts.filter(c => c.status === 'active');

  if (loading) {
    return (
      <ClientLayout title="Meus Contratos" description="Carregando...">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Meus Contratos" description="Veja seus contratos com a Líder Imóveis.">
      <InternalPageHeader title="Meus Contratos" subtitle="Contratos vinculados à sua conta" />

      {contracts.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum contrato encontrado" description="Seus contratos aparecerão aqui quando forem cadastrados." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <KPICard title="Ativos" value={active.length} icon={FileText} />
            <KPICard title="Total" value={contracts.length} icon={FileText} />
          </div>

          <div className="space-y-3">
            {contracts.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{c.contract_number || c.id.slice(0, 8)}</span>
                  <StatusBadge status={c.status} label={getStatusLabel(CONTRACT_STATUS, c.status)} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {c.contract_type} · {c.start_date ? new Date(c.start_date).toLocaleDateString('pt-BR') : '—'}
                  {c.end_date ? ` a ${new Date(c.end_date).toLocaleDateString('pt-BR')}` : ''}
                </p>
                {c.monthly_value && (
                  <p className="text-sm font-bold text-primary mt-2">R$ {c.monthly_value.toLocaleString('pt-BR')}/mês</p>
                )}
                {!c.monthly_value && c.total_value && (
                  <p className="text-sm font-bold text-primary mt-2">R$ {c.total_value.toLocaleString('pt-BR')}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </ClientLayout>
  );
}
