import { Users, Building2, CalendarDays, FileText, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { mockBrokerLeads, mockBrokerVisits, mockCommissions, mockProposals } from '@/data/mock-internal';

const STAGE_LABELS: Record<string, string> = { new: 'Novo', contacted: 'Contatado', visiting: 'Visitando', proposal: 'Proposta' };

export default function BrokerDashboard() {
  const todayVisits = mockBrokerVisits.filter(v => v.status === 'scheduled');
  const pendingCommissions = mockCommissions.filter(c => c.status === 'pending');
  const totalPending = pendingCommissions.reduce((s, c) => s + c.amount, 0);
  const paidCommissions = mockCommissions.filter(c => c.status === 'paid');
  const totalPaid = paidCommissions.reduce((s, c) => s + c.amount, 0);
  const pendingProposals = mockProposals.filter(p => p.status === 'pending');

  return (
    <div>
      <InternalPageHeader title="Dashboard" subtitle="Resumo da sua operação comercial" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Leads ativos" value={mockBrokerLeads.length} icon={Users} description="na sua carteira" />
        <KPICard title="Visitas agendadas" value={todayVisits.length} icon={CalendarDays} description="próximas" />
        <KPICard title="Propostas pendentes" value={pendingProposals.length} icon={FileText} description="aguardando resposta" />
        <KPICard title="Comissão prevista" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} icon={DollarSign} description="a receber" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Meus Leads', path: '/parceiro/leads', icon: Users },
          { label: 'Meus Imóveis', path: '/parceiro/imoveis', icon: Building2 },
          { label: 'Visitas', path: '/parceiro/visitas', icon: CalendarDays },
          { label: 'Comissões', path: '/parceiro/comissoes', icon: DollarSign },
        ].map(action => (
          <Link
            key={action.path}
            to={action.path}
            className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Leads recentes</h2>
            <Link to="/parceiro/leads" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-border">
            {mockBrokerLeads.slice(0, 4).map(lead => (
              <div key={lead.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.interest} · {lead.source}</p>
                </div>
                <StatusBadge status={lead.stage} label={STAGE_LABELS[lead.stage]} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Próximas visitas</h2>
            <Link to="/parceiro/visitas" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-border">
            {mockBrokerVisits.map(visit => (
              <div key={visit.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{visit.property}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {visit.client} · {new Date(visit.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <StatusBadge status={visit.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Summary */}
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
