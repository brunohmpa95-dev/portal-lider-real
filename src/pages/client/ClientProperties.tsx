import ClientLayout from '@/components/client/ClientLayout';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';

export default function ClientProperties() {
  return (
    <ClientLayout title="Meus Imóveis" description="Imóveis vinculados à sua conta.">
      <InternalPageHeader title="Meus Imóveis" subtitle="Imóveis em negociação, alugados ou anunciados" />

      <EmptyState
        icon={Building2}
        title="Nenhum imóvel vinculado"
        description="Quando você tiver imóveis em negociação ou contratados, eles aparecerão aqui."
      />
    </ClientLayout>
  );
}
