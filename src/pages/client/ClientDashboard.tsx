import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Headphones, DollarSign, Home, ArrowRight, Bell, Clock, Loader2 } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { useAuth } from '@/contexts/AuthContext';
import KPICard from '@/components/shared/KPICard';
import { supabase } from '@/integrations/supabase/client';

const shortcuts = [
  { icon: FileText, label: 'Contratos', desc: 'Veja seus contratos, vigência e valores.', path: '/cliente/contratos' },
  { icon: FileText, label: 'Documentos', desc: 'Consulte boletos, contratos, recibos e outros documentos.', path: '/cliente/documentos' },
  { icon: DollarSign, label: 'Financeiro', desc: 'Pagamentos, reajustes e segunda via de boleto.', path: '/cliente/financeiro' },
  { icon: Headphones, label: 'Atendimento', desc: 'Abra uma solicitação ou fale com nossa equipe.', path: '/cliente/atendimento' },
  { icon: Home, label: 'Imóveis', desc: 'Seus imóveis vinculados e em negociação.', path: '/cliente/imoveis' },
];

const ClientDashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contractCount, setContractCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [nextDue, setNextDue] = useState<string | null>(null);

  useEffect(() => { if (user) loadKPIs(); }, [user]);

  async function loadKPIs() {
    setLoading(true);
    const [contractsRes, ticketsRes, billingRes] = await Promise.all([
      supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'active'),
      supabase.from('support_requests').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).in('status', ['open', 'in_progress']),
      supabase.from('billing_records').select('due_date').eq('user_id', user!.id).eq('payment_status', 'pending').order('due_date', { ascending: true }).limit(1),
    ]);
    setContractCount(contractsRes.count || 0);
    setTicketCount(ticketsRes.count || 0);
    const dueDate = billingRes.data?.[0]?.due_date;
    setNextDue(dueDate ? new Date(dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : null);
    setLoading(false);
  }

  return (
    <ClientLayout title="Painel" description="Painel do cliente Líder Imóveis.">
      <h1 className="text-lg sm:text-xl font-sans font-bold text-foreground mb-1">
        Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}
      </h1>
      <p className="text-muted-foreground text-sm mb-6">O que você precisa hoje?</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <KPICard title="Contratos ativos" value={contractCount} icon={FileText} />
            <KPICard title="Próximo vencimento" value={nextDue || '—'} icon={Clock} description="boleto" />
            <KPICard title="Solicitações" value={ticketCount} icon={Bell} description="em andamento" />
          </>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {shortcuts.map(s => (
          <Link
            key={s.path}
            to={s.path}
            className="flex items-start gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
          >
            <s.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-sans font-semibold text-foreground text-sm flex items-center gap-1.5">
                {s.label} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Para dúvidas urgentes, entre em contato pelo WhatsApp ou telefone da Líder Imóveis.
        </p>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
