import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DOCUMENT_STATUS, DOCUMENT_VISIBILITY, getStatusLabel } from '@/types/status';

interface DocRow {
  id: string;
  title: string;
  type: string;
  visibility: string;
  status: string;
  created_at: string;
  file_url: string | null;
  property_id: string | null;
}

export default function AdminDocuments() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents_unified')
      .select('id, title, type, visibility, status, created_at, file_url, property_id')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar documentos'); console.error(error); }
    setDocs(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Documentos" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Documentos" subtitle={`${docs.length} documentos no sistema`} />

      {docs.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum documento" description="Documentos enviados aparecerão aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Título</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Visibilidade</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map(d => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground">{d.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{d.type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={d.visibility === 'client' ? 'new' : d.visibility === 'public' ? 'active' : 'inactive'}
                        label={getStatusLabel(DOCUMENT_VISIBILITY, d.visibility)}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(d.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} label={getStatusLabel(DOCUMENT_STATUS, d.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
