import { useEffect, useState } from 'react';
import { Users, Building2, CalendarDays, FileText, DollarSign, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LEAD_STATUS, getStatusLabel } from '@/types/status';

export default function BrokerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const [leadsRes, visitsRes, commissionsRes, proposalsRes] = await Promise.all([
      supabase.from('property_leads').select('id, name, email, funnel_stage, source, created_at').eq('assigned_to', user!.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('visits').select('id, scheduled_at, status, notes, property_id').eq('agent_id', user!.id).order('scheduled_at', { ascending: true }).limit(10),
      supabase.from('commissions').select('id, amount, status, due_date, paid_at'),
      supabase.from('proposals').select('id, amount, status, created_at'),
    ]);
    setLeads(leadsRes.data || []);
    setVisits(visitsRes.data || []);
    setCommissions(commissionsRes.data || []);
    setProposals(proposalsRes.data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Dashboard" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  const scheduledVisits = visits.filter(v => v.status === 'scheduled');
  const pendingCommissions = commissions.filter(c => c.status === 'pending');
  const totalPending = pendingCommissions.reduce((s: number, c: any) => s + c.amount, 0);
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((s: number, c: any) => s + c.amount, 0);
  const pendingProposals = proposals.filter(p => p.status === 'pending');

  return (
    <div>
      <InternalPageHeader title="Dashboard" subtitle="Resumo da sua operação comercial" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Leads ativos" value={leads.length} icon={Users} description="na sua carteira" />
        <KPICard title="Visitas agendadas" value={scheduledVisits.length} icon={CalendarDays} description="próximas" />
        <KPICard title="Propostas pendentes" value={pendingProposals.length} icon={FileText} description="aguardando resposta" />
        <KPICard title="Comissão prevista" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} icon={DollarSign} description="a receber" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Meus Leads', path: '/parceiro/leads', icon: Users },
          { label: 'Meus Imóveis', path: '/parceiro/imoveis', icon: Building2 },
          { label: 'Visitas', path: '/parceiro/visitas', icon: CalendarDays },
          { label: 'Comissões', path: '/parceiro/comissoes', icon: DollarSign },
        ].map(action => (
          <Link key={action.path} to={action.path} className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <action.icon className="h-4 w-4" />{action.label}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Leads recentes</h2>
            <Link to="/parceiro/leads" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-border">
            {leads.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhum lead atribuído</p>
            ) : leads.slice(0, 4).map(lead => (
              <div key={lead.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.source || 'site'}</p>
                </div>
                <StatusBadge status={lead.funnel_stage} label={getStatusLabel(LEAD_STATUS, lead.funnel_stage)} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Próximas visitas</h2>
            <Link to="/parceiro/visitas" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-border">
            {scheduledVisits.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma visita agendada</p>
            ) : scheduledVisits.slice(0, 4).map(visit => (
              <div key={visit.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {new Date(visit.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <StatusBadge status={visit.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-lg p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Resumo de comissões</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">R$ {totalPaid.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">Recebidas</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-primary">R$ {totalPending.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">A receber</p>
          </div>
        </div>
      </div>
    </div>
  );
}
