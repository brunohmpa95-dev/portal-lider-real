import { useState } from 'react';
import { DollarSign, FileText, AlertCircle, Loader2 } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const ClientFinancial = () => {
  const { user } = useAuth();

  // Boleto search
  const [boletoModal, setBoletoModal] = useState(false);
  const [boletoMes, setBoletoMes] = useState('');
  const [boletoAno, setBoletoAno] = useState(String(CURRENT_YEAR));
  const [boletoResult, setBoletoResult] = useState<any[] | null>(null);
  const [boletoLoading, setBoletoLoading] = useState(false);

  // Document request
  const [docModal, setDocModal] = useState(false);
  const [docTipo, setDocTipo] = useState('');
  const [docPeriodo, setDocPeriodo] = useState('');
  const [docJust, setDocJust] = useState('');
  const [docLoading, setDocLoading] = useState(false);

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

    if (error) { toast.error('Erro ao buscar boletos.'); }
    else { setBoletoResult((data as any[]) || []); }
    setBoletoLoading(false);
  };

  const handleDocSubmit = async () => {
    if (!docTipo) { toast.error('Selecione o tipo de documento.'); return; }
    if (!user) return;
    setDocLoading(true);
    const { error } = await supabase.from('document_requests' as any).insert({
      user_id: user.id, tipo_documento: docTipo, periodo: docPeriodo.trim() || null, justificativa: docJust.trim() || null,
    } as any);
    if (error) { toast.error('Erro ao enviar. Tente novamente.'); }
    else { toast.success('Solicitação enviada com sucesso!'); setDocTipo(''); setDocPeriodo(''); setDocJust(''); setDocModal(false); }
    setDocLoading(false);
  };

  return (
    <ClientLayout title="Financeiro" description="Acompanhe pagamentos e informações financeiras.">
      <h1 className="text-xl font-sans font-bold text-foreground mb-1">Financeiro</h1>
      <p className="text-muted-foreground text-sm mb-6">Acompanhe seus pagamentos e documentos financeiros.</p>

      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <DollarSign className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">Segunda via de boleto</p>
              <p className="text-sm text-muted-foreground mb-3">Selecione o mês e ano para buscar seus boletos.</p>
              <Button size="sm" onClick={() => { setBoletoResult(null); setBoletoModal(true); }}>Buscar boleto</Button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <FileText className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">Declarações e recibos</p>
              <p className="text-sm text-muted-foreground mb-3">Solicite declaração de quitação, recibos de pagamento e outros documentos financeiros.</p>
              <Button size="sm" variant="outline" onClick={() => setDocModal(true)}>Solicitar</Button>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Dúvidas sobre reajustes ou negociações?</p>
            <p className="text-xs text-amber-700 mt-0.5">Entre em contato pelo WhatsApp ou telefone com nosso setor financeiro.</p>
          </div>
        </div>
      </div>

      {/* Boleto Modal */}
      <Dialog open={boletoModal} onOpenChange={setBoletoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Segunda via de boleto</DialogTitle>
            <DialogDescription>Selecione o mês e ano para buscar boletos disponíveis.</DialogDescription>
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
            <DialogDescription>Selecione o tipo de documento e o período desejado.</DialogDescription>
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
              <Input value={docPeriodo} onChange={e => setDocPeriodo(e.target.value)} placeholder="Ex: 2024, Jan-Jun 2024" />
            </div>
            <div>
              <Label>Justificativa</Label>
              <Textarea value={docJust} onChange={e => setDocJust(e.target.value)} placeholder="Informe o motivo da solicitação..." rows={3} />
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

export default ClientFinancial;
