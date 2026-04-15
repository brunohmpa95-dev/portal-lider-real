import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PROPOSAL_STATUS, getStatusLabel } from '@/types/status';

export default function BrokerProposals() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProposals(); }, []);

  async function loadProposals() {
    setLoading(true);
    const { data } = await supabase
      .from('proposals')
      .select('id, amount, status, created_at, notes, property_id')
      .order('created_at', { ascending: false });
    setProposals(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Propostas" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Propostas" subtitle={`${proposals.length} propostas registradas`} />

      {proposals.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma proposta" description="Suas propostas enviadas aparecerão aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Observações</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposals.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground font-medium">R$ {p.amount.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} label={getStatusLabel(PROPOSAL_STATUS, p.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">{p.notes || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
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
