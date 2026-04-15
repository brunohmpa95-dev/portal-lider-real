import { useEffect, useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { COMMISSION_STATUS, getStatusLabel } from '@/types/status';

export default function BrokerCommissions() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCommissions(); }, []);

  async function loadCommissions() {
    setLoading(true);
    const { data } = await supabase
      .from('commissions')
      .select('id, amount, status, due_date, paid_at')
      .order('created_at', { ascending: false });
    setCommissions(data || []);
    setLoading(false);
  }

  const paid = commissions.filter(c => c.status === 'paid');
  const pending = commissions.filter(c => c.status === 'pending');
  const totalPaid = paid.reduce((s: number, c: any) => s + c.amount, 0);
  const totalPending = pending.reduce((s: number, c: any) => s + c.amount, 0);

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Comissões" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Comissões" subtitle="Acompanhe suas comissões previstas e recebidas" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <KPICard title="Recebidas" value={`R$ ${totalPaid.toLocaleString('pt-BR')}`} icon={DollarSign} description={`${paid.length} pagas`} />
        <KPICard title="Pendentes" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} icon={DollarSign} description={`${pending.length} a receber`} />
      </div>

      {commissions.length === 0 ? (
        <EmptyState icon={DollarSign} title="Nenhuma comissão" description="Suas comissões aparecerão aqui quando forem registradas." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Vencimento / Pgto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
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
