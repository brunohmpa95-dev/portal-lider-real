import { Users, Building2, CalendarDays, FileText, DollarSign, TrendingUp } from 'lucide-react';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { mockBrokerLeads, mockBrokerVisits, mockCommissions } from '@/data/mock-internal';

export default function BrokerDashboard() {
  const todayVisits = mockBrokerVisits.filter(v => v.status === 'scheduled');
  const pendingCommissions = mockCommissions.filter(c => c.status === 'pending');
  const totalPending = pendingCommissions.reduce((s, c) => s + c.amount, 0);

  return (
    <div>
      <InternalPageHeader title="Dashboard" subtitle="Resumo da sua operação comercial" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Leads ativos" value={mockBrokerLeads.length} icon={Users} description="na sua carteira" />
        <KPICard title="Visitas agendadas" value={todayVisits.length} icon={CalendarDays} description="próximas" />
        <KPICard title="Propostas" value={4} icon={FileText} description="em andamento" />
        <KPICard title="Comissão prevista" value={`R$ ${totalPending.toLocaleString('pt-BR')}`} icon={DollarSign} description="a receber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Leads recentes</h2>
          </div>
          <div className="divide-y divide-border">
            {mockBrokerLeads.slice(0, 4).map(lead => (
              <div key={lead.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.interest} · {lead.source}</p>
                </div>
                <StatusBadge status={lead.stage} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Próximas visitas</h2>
          </div>
          <div className="divide-y divide-border">
            {mockBrokerVisits.map(visit => (
              <div key={visit.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{visit.property}</p>
                  <p className="text-xs text-muted-foreground">{visit.client} · {new Date(visit.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <StatusBadge status={visit.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
