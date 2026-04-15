import { useEffect, useState } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Building2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadProperties(); }, [user]);

  async function loadProperties() {
    setLoading(true);
    // Get properties via contracts linked to this user
    const { data: contracts } = await supabase
      .from('contracts')
      .select('property_id')
      .eq('user_id', user!.id)
      .not('property_id', 'is', null);

    const propertyIds = [...new Set((contracts || []).map(c => c.property_id).filter(Boolean))] as string[];

    if (propertyIds.length > 0) {
      const { data } = await supabase
        .from('properties')
        .select('id, code, title, price, rent_price, purpose, status, neighborhood, city')
        .in('id', propertyIds);
      setProperties(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <ClientLayout title="Meus Imóveis" description="Carregando...">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Meus Imóveis" description="Imóveis vinculados à sua conta.">
      <InternalPageHeader title="Meus Imóveis" subtitle="Imóveis em negociação, alugados ou anunciados" />

      {properties.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhum imóvel vinculado" description="Quando você tiver imóveis em negociação ou contratados, eles aparecerão aqui." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {properties.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{p.code}</span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground">{p.neighborhood} · {p.city}</p>
              <p className="text-base font-bold text-primary mt-2">
                {p.purpose === 'rent' ? `R$ ${(p.rent_price || p.price).toLocaleString('pt-BR')}/mês` : `R$ ${p.price.toLocaleString('pt-BR')}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
