import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { Headphones, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TICKET_STATUS, TICKET_PRIORITY, getStatusLabel } from '@/types/status';

interface TicketRow {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  user_id: string;
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_requests')
      .select('id, subject, category, priority, status, created_at, user_id')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar chamados'); console.error(error); }
    setTickets(data || []);
    setLoading(false);
  }

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in_progress').length;
  const highPriority = tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length;

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Chamados" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Chamados" subtitle="Fila de atendimento e suporte ao cliente" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Abertos" value={openCount} icon={Headphones} />
        <KPICard title="Em andamento" value={inProgress} icon={Headphones} />
        <KPICard title="Alta prioridade" value={highPriority} icon={AlertTriangle} description="requer atenção" />
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon={Headphones} title="Nenhum chamado" description="Chamados de clientes aparecerão aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Assunto</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Prioridade</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{t.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={t.priority === 'high' || t.priority === 'urgent' ? 'overdue' : t.priority === 'low' ? 'inactive' : 'pending'}
                        label={getStatusLabel(TICKET_PRIORITY, t.priority)}
                      />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} label={getStatusLabel(TICKET_STATUS, t.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
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
