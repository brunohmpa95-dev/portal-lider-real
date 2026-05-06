import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { INTERACTION_TYPE_OPTIONS } from '@/types/admin';

interface Props {
  leadId: string | null;
  leadName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'note' | 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting';
  onDone?: () => void;
}

const OUTCOME_OPTIONS = [
  { value: '', label: 'Sem resultado específico' },
  { value: 'sucesso', label: 'Sucesso / contato efetivo' },
  { value: 'sem_resposta', label: 'Sem resposta' },
  { value: 'reagendar', label: 'Reagendar' },
  { value: 'interessado', label: 'Interessado' },
  { value: 'nao_interessado', label: 'Não interessado' },
  { value: 'aguardando_cliente', label: 'Aguardando cliente' },
];

// Tipos visíveis (sem stage_change que é gerado por sistema)
const SELECTABLE_TYPES = INTERACTION_TYPE_OPTIONS.filter((o) => o.value !== 'stage_change');

export default function QuickInteractionDialog({ leadId, leadName, open, onOpenChange, defaultType = 'note', onDone }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<string>(defaultType);
  const [content, setContent] = useState('');
  const [outcome, setOutcome] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [nextStepAt, setNextStepAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sincroniza tipo padrão sempre que reabrir o dialog
  useEffect(() => {
    if (open) setType(defaultType);
  }, [open, defaultType]);

  function reset() {
    setContent('');
    setOutcome('');
    setNextStep('');
    setNextStepAt('');
    setShowAdvanced(false);
    setType(defaultType);
  }

  async function save() {
    if (!leadId || !content.trim()) return;
    setSaving(true);
    const payload: Record<string, any> = {
      lead_id: leadId,
      user_id: user?.id,
      interaction_type: type,
      content: content.trim(),
    };
    if (outcome) payload.outcome = outcome;
    if (nextStep.trim()) payload.next_step = nextStep.trim();
    if (nextStepAt) payload.next_step_at = new Date(nextStepAt).toISOString();

    const { error } = await supabase.from('lead_interactions' as any).insert(payload as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Interação registrada' });
    reset();
    onOpenChange(false);
    onDone?.();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar interação{leadName ? ` — ${leadName}` : ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SELECTABLE_TYPES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Resumo *</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="O que foi conversado..."
              autoFocus
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
          >
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showAdvanced ? 'Ocultar campos avançados' : 'Resultado e próximo passo'}
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-1 border-t">
              <div className="space-y-1.5">
                <Label>Resultado</Label>
                <Select value={outcome || '__none__'} onValueChange={(v) => setOutcome(v === '__none__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Sem resultado específico" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem resultado específico</SelectItem>
                    {OUTCOME_OPTIONS.filter((o) => o.value).map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Próximo passo</Label>
                <Input
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  maxLength={255}
                  placeholder="Ex: Enviar proposta, agendar visita..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Quando (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={nextStepAt}
                  onChange={(e) => setNextStepAt(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Define automaticamente o follow-up do lead.
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={save} disabled={saving || !content.trim()}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
