import { useState } from 'react';
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const STORAGE_DOCS = [
  { title: 'Contrato de locação', file: 'contrato-locacao.pdf', desc: 'Modelo padrão de contrato de locação residencial.' },
  { title: 'Ficha cadastral', file: 'ficha-cadastral.pdf', desc: 'Ficha para cadastro de novos locatários.' },
  { title: 'Laudo de vistoria', file: 'laudo-vistoria.pdf', desc: 'Modelo de laudo de vistoria de entrada e saída.' },
  { title: 'Autorização de venda', file: 'autorizacao-venda.pdf', desc: 'Documento de autorização para comercialização do imóvel.' },
];

const ClientDocuments = () => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  // Boleto modal
  const [boletoModal, setBoletoModal] = useState(false);
  const [boletoMes, setBoletoMes] = useState('');
  const [boletoAno, setBoletoAno] = useState(String(CURRENT_YEAR));
  const [boletoResult, setBoletoResult] = useState<any[] | null>(null);
  const [boletoLoading, setBoletoLoading] = useState(false);

  // Document request modal
  const [docModal, setDocModal] = useState(false);
  const [docTipo, setDocTipo] = useState('');
  const [docPeriodo, setDocPeriodo] = useState('');
  const [docJust, setDocJust] = useState('');
  const [docLoading, setDocLoading] = useState(false);

  const handleDownload = async (fileName: string) => {
    setDownloading(fileName);
    const { data, error } = await supabase.storage.from('documentos-modelos').download(fileName);
    if (error || !data) {
      toast.error('Arquivo não disponível no momento.');
      setDownloading(null);
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  const handleBoletoSearch = async () => {
    if (!boletoMes || !boletoAno) { toast.error('Selecione mês e ano.'); return; }
    if (!user) return;
    setBoletoLoading(true);
    const { data, error } = await supabase
      .from('boletos' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('mes', parseInt(boletoMes))
      .eq('ano', parseInt(boletoAno));
    if (error) toast.error('Erro ao buscar boletos.');
    else setBoletoResult((data as any[]) || []);
    setBoletoLoading(false);
  };

  const handleDocSubmit = async () => {
    if (!docTipo) { toast.error('Selecione o tipo de documento.'); return; }
    if (!user) return;
    setDocLoading(true);
    const { error } = await supabase.from('document_requests' as any).insert({
      user_id: user.id, tipo_documento: docTipo, periodo: docPeriodo.trim() || null, justificativa: docJust.trim() || null,
    } as any);
    if (error) toast.error('Erro ao enviar. Tente novamente.');
    else { toast.success('Solicitação enviada com sucesso!'); setDocTipo(''); setDocPeriodo(''); setDocJust(''); setDocModal(false); }
    setDocLoading(false);
  };

  return (
    <ClientLayout title="Documentos" description="Acesse documentos e formulários da Líder Imóveis.">
      <h1 className="text-xl font-sans font-bold text-foreground mb-1">Documentos</h1>
      <p className="text-muted-foreground text-sm mb-6">Acesse documentos, formulários e modelos úteis.</p>

      <div className="space-y-3">
        {/* Segunda via de boleto */}
        <button
          onClick={() => { setBoletoResult(null); setBoletoModal(true); }}
          className="w-full flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all group text-left"
        >
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-sans font-semibold text-foreground text-sm">Segunda via de boleto</p>
            <p className="text-xs text-muted-foreground">Selecione o mês para gerar a segunda via do boleto.</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Download docs */}
        {STORAGE_DOCS.map(doc => (
          <button
            key={doc.file}
            onClick={() => handleDownload(doc.file)}
            disabled={downloading === doc.file}
            className="w-full flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all group text-left disabled:opacity-50"
          >
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-sans font-semibold text-foreground text-sm">{doc.title}</p>
              <p className="text-xs text-muted-foreground">{doc.desc}</p>
            </div>
            {downloading === doc.file ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Download className="h-4 w-4 text-muted-foreground" />}
          </button>
        ))}

        {/* Declaração de quitação */}
        <button
          onClick={() => setDocModal(true)}
          className="w-full flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all group text-left"
        >
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-sans font-semibold text-foreground text-sm">Declaração de quitação</p>
            <p className="text-xs text-muted-foreground">Solicite sua declaração de quitação ou recibos.</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Boleto Modal */}
      <Dialog open={boletoModal} onOpenChange={setBoletoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Segunda via de boleto</DialogTitle>
            <DialogDescription>Selecione o mês e ano para buscar boletos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mês</Label>
                <Select value={boletoMes} onValueChange={setBoletoMes}>
                  <SelectTrigger><SelectValue placeholder="Mês" /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano</Label>
                <Select value={boletoAno} onValueChange={setBoletoAno}>
                  <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleBoletoSearch} disabled={boletoLoading} className="w-full">
              {boletoLoading && <Loader2 className="h-4 w-4 animate-spin" />} Gerar 2ª via
            </Button>
            {boletoResult !== null && (
              <div className="border border-border rounded-lg p-4">
                {boletoResult.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">Nenhum boleto pendente para o período selecionado.</p>
                ) : (
                  <div className="space-y-2">
                    {boletoResult.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">R$ {Number(b.valor).toFixed(2)} — {b.status}</span>
                        {b.link_boleto ? (
                          <a href={b.link_boleto} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">Baixar</a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem link</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Request Modal */}
      <Dialog open={docModal} onOpenChange={setDocModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar documento</DialogTitle>
            <DialogDescription>Selecione o tipo de documento e o período.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de documento</Label>
              <Select value={docTipo} onValueChange={setDocTipo}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {['Declaração de quitação', 'Recibo de pagamento', 'Outro'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período / Ano de referência</Label>
              <Input value={docPeriodo} onChange={e => setDocPeriodo(e.target.value)} placeholder="Ex: 2024" />
            </div>
            <div>
              <Label>Justificativa</Label>
              <Textarea value={docJust} onChange={e => setDocJust(e.target.value)} placeholder="Motivo da solicitação..." rows={3} />
            </div>
            <Button onClick={handleDocSubmit} disabled={docLoading} className="w-full">
              {docLoading && <Loader2 className="h-4 w-4 animate-spin" />} Solicitar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
};

export default ClientDocuments;
