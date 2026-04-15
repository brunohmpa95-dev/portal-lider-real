import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import DocumentUploadDialog from '@/components/admin/DocumentUploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileText, Plus, Search, Download, Trash2, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { secureDownload, secureDelete, type StorageBucket } from '@/lib/secure-storage';
import { logAudit } from '@/lib/audit';
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
  profile_id: string | null;
  contract_id: string | null;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  contrato: 'Contrato',
  vistoria: 'Laudo de Vistoria',
  comprovante: 'Comprovante',
  ficha_cadastral: 'Ficha Cadastral',
  procuracao: 'Procuração',
  declaracao: 'Declaração',
  recibo: 'Recibo',
  outro: 'Outro',
  general: 'Geral',
};

export default function AdminDocuments() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents_unified')
      .select('id, title, type, visibility, status, created_at, file_url, property_id, profile_id, contract_id')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar documentos'); console.error(error); }
    setDocs(data || []);
    setLoading(false);
  }

  const filtered = docs.filter(d => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (filterVisibility !== 'all' && d.visibility !== filterVisibility) return false;
    return true;
  });

  const pending = docs.filter(d => d.status === 'pending').length;
  const withFile = docs.filter(d => d.file_url).length;

  async function handleDownload(doc: DocRow) {
    if (!doc.file_url) { toast.error('Documento sem arquivo vinculado.'); return; }
    setDownloading(doc.id);
    try {
      // file_url format: "bucket/path"
      const slashIdx = doc.file_url.indexOf('/');
      const bucket = doc.file_url.substring(0, slashIdx) as StorageBucket;
      const path = doc.file_url.substring(slashIdx + 1);
      const result = await secureDownload(bucket, path);
      window.open(result.url, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao baixar documento.');
    }
    setDownloading(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Delete file from storage if exists
      if (deleteTarget.file_url) {
        const slashIdx = deleteTarget.file_url.indexOf('/');
        const bucket = deleteTarget.file_url.substring(0, slashIdx) as StorageBucket;
        const path = deleteTarget.file_url.substring(slashIdx + 1);
        await secureDelete(bucket, path);
      }
      // Delete record
      const { error } = await supabase.from('documents_unified').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      await logAudit('document_delete', 'documents', 'document', deleteTarget.id, { title: deleteTarget.title });
      toast.success('Documento excluído.');
      setDeleteTarget(null);
      loadDocs();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir.');
    }
    setDeleting(false);
  }

  async function handleStatusChange(doc: DocRow, newStatus: string) {
    const { error } = await supabase.from('documents_unified').update({ status: newStatus }).eq('id', doc.id);
    if (error) { toast.error('Erro ao atualizar status'); return; }
    await logAudit('document_status_change', 'documents', 'document', doc.id, { from: doc.status, to: newStatus });
    toast.success(`Status alterado para "${getStatusLabel(DOCUMENT_STATUS, newStatus)}".`);
    loadDocs();
  }

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Gestão de Documentos" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Gestão de Documentos" subtitle={`${docs.length} documentos no sistema`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total" value={docs.length} icon={FileText} />
        <KPICard title="Com arquivo" value={withFile} icon={FileText} />
        <KPICard title="Pendentes" value={pending} icon={FileText} description="aguardando ação" />
        <div className="flex items-end">
          <Button onClick={() => setUploadOpen(true)} className="w-full h-full min-h-[72px] flex-col gap-1">
            <Plus className="h-5 w-5" />
            <span className="text-xs">Enviar documento</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por título..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(DOCUMENT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterVisibility} onValueChange={setFilterVisibility}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Visibilidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(DOCUMENT_VISIBILITY).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum documento encontrado" description={docs.length === 0 ? 'Envie um documento para começar.' : 'Tente ajustar os filtros.'} />
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
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate max-w-[200px]">{d.title}</span>
                          {(d.profile_id || d.contract_id || d.property_id) && (
                            <span className="text-[10px] text-muted-foreground">
                              {d.profile_id && 'Cliente'}
                              {d.contract_id && ' · Contrato'}
                              {d.property_id && ' · Imóvel'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{DOC_TYPE_LABELS[d.type] || d.type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={d.visibility === 'client' ? 'new' : d.visibility === 'public' ? 'active' : 'inactive'}
                        label={getStatusLabel(DOCUMENT_VISIBILITY, d.visibility)}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(d.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <Select value={d.status} onValueChange={v => handleStatusChange(d, v)}>
                        <SelectTrigger className="h-7 w-[100px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(DOCUMENT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {d.file_url && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(d)} disabled={downloading === d.id}>
                            {downloading === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(d)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Mostrando {filtered.length} de {docs.length} documentos
          </div>
        </div>
      )}

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onSuccess={loadDocs} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.title}"? O arquivo será removido permanentemente do armazenamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
