import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { secureUpload, validateFileClient, type StorageBucket } from '@/lib/secure-storage';
import { supabase } from '@/integrations/supabase/client';
import { logAudit } from '@/lib/audit';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DOC_TYPES = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'vistoria', label: 'Laudo de Vistoria' },
  { value: 'comprovante', label: 'Comprovante' },
  { value: 'ficha_cadastral', label: 'Ficha Cadastral' },
  { value: 'procuracao', label: 'Procuração' },
  { value: 'declaracao', label: 'Declaração' },
  { value: 'recibo', label: 'Recibo' },
  { value: 'outro', label: 'Outro' },
];

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Interno (somente admin)' },
  { value: 'client', label: 'Visível para o cliente' },
  { value: 'public', label: 'Público' },
];

const BUCKET_MAP: Record<string, StorageBucket> = {
  private: 'internal-documents',
  client: 'customer-documents',
  public: 'internal-documents',
};

export default function DocumentUploadDialog({ open, onOpenChange, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [profileId, setProfileId] = useState('');
  const [contractId, setContractId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'saving' | 'done'>('idle');

  function reset() {
    setFile(null);
    setTitle('');
    setType('');
    setVisibility('private');
    setProfileId('');
    setContractId('');
    setPropertyId('');
    setProgress('idle');
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const bucket = BUCKET_MAP[visibility] || 'internal-documents';
    const error = validateFileClient(f, bucket);
    if (error) {
      toast.error(error);
      e.target.value = '';
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  }

  async function handleSubmit() {
    if (!file) { toast.error('Selecione um arquivo.'); return; }
    if (!title.trim()) { toast.error('Informe um título.'); return; }
    if (!type) { toast.error('Selecione o tipo de documento.'); return; }

    setUploading(true);
    setProgress('uploading');

    try {
      const bucket = BUCKET_MAP[visibility] || 'internal-documents';
      const folder = profileId || 'general';

      const result = await secureUpload({ bucket, file, folder });

      setProgress('saving');

      const { error } = await supabase.from('documents_unified').insert([{
        title: title.trim(),
        type,
        visibility,
        status: 'active',
        file_url: `${bucket}/${result.path}`,
        profile_id: profileId || null,
        contract_id: contractId || null,
        property_id: propertyId || null,
      }]);

      if (error) throw error;

      await logAudit('document_upload', 'documents', 'document', undefined, {
        title: title.trim(),
        type,
        visibility,
        bucket,
        originalName: file.name,
        size: file.size,
      });

      setProgress('done');
      toast.success('Documento enviado com sucesso!');
      setTimeout(() => {
        reset();
        onOpenChange(false);
        onSuccess();
      }, 800);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar documento.');
      setProgress('idle');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!uploading) { reset(); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
          <DialogDescription>Faça upload de um documento com metadados e controle de visibilidade.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File picker */}
          <div>
            <Label>Arquivo *</Label>
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                  <button onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <Upload className="h-5 w-5 mx-auto mb-1 text-primary" />
                  Clique para selecionar (PDF, DOC, XLS, JPG, PNG — máx 10MB)
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Título *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Contrato de locação - Apt 301" className="mt-1" disabled={uploading} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={setType} disabled={uploading}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibilidade</Label>
              <Select value={visibility} onValueChange={setVisibility} disabled={uploading}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">ID do Cliente</Label>
              <Input value={profileId} onChange={e => setProfileId(e.target.value)} placeholder="Opcional" className="mt-1 h-8 text-xs" disabled={uploading} />
            </div>
            <div>
              <Label className="text-xs">ID do Contrato</Label>
              <Input value={contractId} onChange={e => setContractId(e.target.value)} placeholder="Opcional" className="mt-1 h-8 text-xs" disabled={uploading} />
            </div>
            <div>
              <Label className="text-xs">ID do Imóvel</Label>
              <Input value={propertyId} onChange={e => setPropertyId(e.target.value)} placeholder="Opcional" className="mt-1 h-8 text-xs" disabled={uploading} />
            </div>
          </div>

          {/* Progress feedback */}
          {progress !== 'idle' && (
            <div className="flex items-center gap-2 text-sm p-3 bg-muted/50 rounded-lg">
              {progress === 'done' ? (
                <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-700">Documento enviado!</span></>
              ) : (
                <><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-muted-foreground">{progress === 'uploading' ? 'Enviando arquivo...' : 'Salvando metadados...'}</span></>
              )}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={uploading || !file} className="w-full">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Enviar documento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
