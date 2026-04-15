import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';

const mockProperties = [
  { id: '1', code: 'LDR-0045', title: 'Casa 3 Quartos - Centro', price: 385000, purpose: 'Venda', status: 'published', neighborhood: 'Centro' },
  { id: '2', code: 'LDR-0078', title: 'Apartamento 2Q - São Geraldo', price: 245000, purpose: 'Venda', status: 'published', neighborhood: 'São Geraldo' },
  { id: '3', code: 'LDR-0102', title: 'Lote Residencial - Piedade', price: 120000, purpose: 'Venda', status: 'published', neighborhood: 'Piedade' },
  { id: '4', code: 'LDR-0115', title: 'Sala Comercial - Centro', price: 1800, purpose: 'Locação', status: 'published', neighborhood: 'Centro' },
];

export default function BrokerProperties() {
  return (
    <div>
      <InternalPageHeader title="Meus Imóveis" subtitle="Imóveis atribuídos à sua carteira" />

      {mockProperties.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhum imóvel atribuído" description="Quando imóveis forem atribuídos a você, eles aparecerão aqui." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProperties.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{p.code}</span>
                <StatusBadge status={p.status} label={p.purpose} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{p.neighborhood} · Itaúna</p>
              <p className="text-base font-bold text-primary">
                {p.purpose === 'Locação' ? `R$ ${p.price.toLocaleString('pt-BR')}/mês` : `R$ ${p.price.toLocaleString('pt-BR')}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
