import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Building2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function BrokerProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProperties(); }, []);

  async function loadProperties() {
    setLoading(true);
    const { data } = await supabase
      .from('properties')
      .select('id, code, title, price, rent_price, purpose, status, neighborhood, city')
      .order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Meus Imóveis" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Meus Imóveis" subtitle={`${properties.length} imóveis atribuídos`} />

      {properties.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhum imóvel atribuído" description="Quando imóveis forem atribuídos a você, eles aparecerão aqui." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{p.code}</span>
                <StatusBadge status={p.status} label={p.purpose === 'rent' ? 'Locação' : 'Venda'} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{p.neighborhood || ''} · {p.city}</p>
              <p className="text-base font-bold text-primary">
                {p.purpose === 'rent' ? `R$ ${(p.rent_price || p.price).toLocaleString('pt-BR')}/mês` : `R$ ${p.price.toLocaleString('pt-BR')}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
