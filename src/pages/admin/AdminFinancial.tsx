import { useEffect, useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { COMMISSION_STATUS, getStatusLabel } from '@/types/status';

interface CommissionRow {
  id: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  broker_id: string;
  brokers?: { profiles?: { full_name: string | null } | null } | null;
}

export default function AdminFinancial() {
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('commissions')
      .select('id, amount, status, due_date, paid_at, broker_id, brokers(profiles(full_name))')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar dados financeiros'); console.error(error); }
    setCommissions((data as any[]) || []);
    setLoading(false);
  }

  const paid = commissions.filter(c => c.status === 'paid');
  const pending = commissions.filter(c => c.status === 'pending');
  const totalPaid = paid.reduce((s, c) => s + c.amount, 0);
  const totalPending = pending.reduce((s, c) => s + c.amount, 0);

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Financeiro" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Financeiro" subtitle="Comissões, títulos e repasses" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Recebido" value={`R$ ${totalPaid.toLocaleString('pt-BR')}`} icon={DollarSign} />
        <KPICard title="Pendente" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} icon={DollarSign} />
        <KPICard title="Total comissões" value={commissions.length} icon={DollarSign} />
      </div>

      {commissions.length === 0 ? (
        <EmptyState icon={DollarSign} title="Nenhuma comissão registrada" description="Comissões vinculadas a contratos aparecerão aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Corretor</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Vencimento / Pgto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{c.brokers?.profiles?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-foreground font-medium">R$ {c.amount.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} label={getStatusLabel(COMMISSION_STATUS, c.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {c.paid_at ? new Date(c.paid_at).toLocaleDateString('pt-BR') : c.due_date ? new Date(c.due_date).toLocaleDateString('pt-BR') : '—'}
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
