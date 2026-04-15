import ClientLayout from '@/components/client/ClientLayout';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { mockContracts } from '@/data/mock-internal';
import { FileText } from 'lucide-react';

export default function ClientContracts() {
  const clientContracts = mockContracts.slice(0, 3); // Simula contratos do cliente
  const active = clientContracts.filter(c => c.status === 'active');

  return (
    <ClientLayout title="Meus Contratos" description="Veja seus contratos com a Líder Imóveis.">
      <InternalPageHeader title="Meus Contratos" subtitle="Contratos vinculados à sua conta" />

      {clientContracts.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum contrato encontrado" description="Seus contratos aparecerão aqui quando forem cadastrados." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <KPICard title="Ativos" value={active.length} icon={FileText} />
            <KPICard title="Total" value={clientContracts.length} icon={FileText} />
          </div>

          <div className="space-y-3">
            {clientContracts.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{c.number}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{c.property}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {c.type} · {c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—'}
                  {c.endDate ? ` a ${new Date(c.endDate).toLocaleDateString('pt-BR')}` : ''}
                </p>
                {c.monthlyValue && (
                  <p className="text-sm font-bold text-primary mt-2">R$ {c.monthlyValue.toLocaleString('pt-BR')}/mês</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </ClientLayout>
  );
}
