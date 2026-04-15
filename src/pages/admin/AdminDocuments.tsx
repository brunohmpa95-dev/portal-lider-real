import InternalPageHeader from '@/components/shared/InternalPageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

export default function AdminDocuments() {
  return (
    <div>
      <InternalPageHeader title="Documentos" subtitle="Upload, categorização e visibilidade de documentos" />

      <EmptyState
        icon={FileText}
        title="Módulo de documentos"
        description="Gerencie documentos vinculados a clientes, imóveis e contratos. Faça upload, defina visibilidade e acompanhe pendências."
      />
    </div>
  );
}
