import { useState } from 'react';
import { Wrench, ClipboardCheck, Phone, Loader2 } from 'lucide-react';
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

type ModalType = 'manutencao' | 'vistoria' | 'atendimento' | null;

const ClientRental = () => {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);

  // Manutenção
  const [maintTipo, setMaintTipo] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintUrg, setMaintUrg] = useState('');

  // Vistoria
  const [inspTipo, setInspTipo] = useState('');
  const [inspData, setInspData] = useState('');
  const [inspObs, setInspObs] = useState('');

  // Atendimento
  const [atenAssunto, setAtenAssunto] = useState('');
  const [atenMsg, setAtenMsg] = useState('');

  const resetForms = () => {
    setMaintTipo(''); setMaintDesc(''); setMaintUrg('');
    setInspTipo(''); setInspData(''); setInspObs('');
    setAtenAssunto(''); setAtenMsg('');
  };

  const handleMaintSubmit = async () => {
    if (!maintTipo || !maintDesc.trim() || !maintUrg) { toast.error('Preencha todos os campos.'); return; }
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('maintenance_requests' as any).insert({
      user_id: user.id, tipo: maintTipo, descricao: maintDesc.trim(), urgencia: maintUrg,
    } as any);
    if (error) { toast.error('Erro ao enviar. Tente novamente.'); }
    else { toast.success('Solicitação de manutenção enviada!'); resetForms(); setModal(null); }
    setLoading(false);
  };

  const handleInspSubmit = async () => {
    if (!inspTipo) { toast.error('Selecione o tipo de vistoria.'); return; }
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('inspections' as any).insert({
      user_id: user.id, tipo: inspTipo, data_preferencial: inspData || null, observacoes: inspObs.trim() || null,
    } as any);
    if (error) { toast.error('Erro ao enviar. Tente novamente.'); }
    else { toast.success('Vistoria agendada com sucesso!'); resetForms(); setModal(null); }
    setLoading(false);
  };

  const handleAtenSubmit = async () => {
    if (!atenAssunto.trim() || !atenMsg.trim()) { toast.error('Preencha todos os campos.'); return; }
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('rental_inquiries' as any).insert({
      user_id: user.id, assunto: atenAssunto.trim(), mensagem: atenMsg.trim(),
    } as any);
    if (error) { toast.error('Erro ao enviar. Tente novamente.'); }
    else { toast.success('Solicitação enviada com sucesso!'); resetForms(); setModal(null); }
    setLoading(false);
  };

  const cards = [
    { icon: Wrench, title: 'Manutenções', desc: 'Solicite reparos ou manutenções no seu imóvel alugado.', key: 'manutencao' as ModalType },
    { icon: ClipboardCheck, title: 'Vistorias', desc: 'Agende vistoria de entrada, saída ou acompanhamento.', key: 'vistoria' as ModalType },
    { icon: Phone, title: 'Atendimento', desc: 'Fale diretamente com o setor de locação para outras questões.', key: 'atendimento' as ModalType },
  ];

  return (
    <ClientLayout title="Locação" description="Informações e atendimento sobre locação de imóveis.">
      <h1 className="text-lg sm:text-xl font-sans font-bold text-foreground mb-1">Locação</h1>
      <p className="text-muted-foreground text-sm mb-6">Informações e atendimento sobre seu imóvel alugado.</p>

      <div className="space-y-4">
        {cards.map(item => (
          <button
            key={item.title}
            onClick={() => setModal(item.key)}
            className="w-full bg-card border border-border rounded-lg p-5 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all text-left"
          >
            <item.icon className="h-7 w-7 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Manutenção Modal */}
      <Dialog open={modal === 'manutencao'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitar manutenção</DialogTitle>
            <DialogDescription>Descreva o problema para agendar um reparo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de manutenção</Label>
              <Select value={maintTipo} onValueChange={setMaintTipo}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {['Hidráulica', 'Elétrica', 'Estrutural', 'Acabamento', 'Outro'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição do problema</Label>
              <Textarea value={maintDesc} onChange={e => setMaintDesc(e.target.value)} placeholder="Descreva o problema..." rows={3} />
            </div>
            <div>
              <Label>Urgência</Label>
              <Select value={maintUrg} onValueChange={setMaintUrg}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {[{ v: 'baixa', l: 'Baixa' }, { v: 'media', l: 'Média' }, { v: 'alta', l: 'Alta' }].map(u => <SelectItem key={u.v} value={u.v}>{u.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleMaintSubmit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vistoria Modal */}
      <Dialog open={modal === 'vistoria'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar vistoria</DialogTitle>
            <DialogDescription>Selecione o tipo e a data preferencial.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de vistoria</Label>
              <Select value={inspTipo} onValueChange={setInspTipo}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {['Entrada', 'Saída', 'Acompanhamento'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data preferencial</Label>
              <Input type="date" value={inspData} onChange={e => setInspData(e.target.value)} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={inspObs} onChange={e => setInspObs(e.target.value)} placeholder="Informações adicionais..." rows={3} />
            </div>
            <Button onClick={handleInspSubmit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Agendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Atendimento Modal */}
      <Dialog open={modal === 'atendimento'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitar atendimento</DialogTitle>
            <DialogDescription>Entre em contato com o setor de locação.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Assunto</Label>
              <Input value={atenAssunto} onChange={e => setAtenAssunto(e.target.value)} placeholder="Ex: Dúvida sobre contrato" />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea value={atenMsg} onChange={e => setAtenMsg(e.target.value)} placeholder="Descreva sua solicitação..." rows={4} />
            </div>
            <Button onClick={handleAtenSubmit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
};

export default ClientRental;
