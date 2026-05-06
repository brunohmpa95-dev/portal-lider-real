import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskMutations, type Task } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Phone, MessageSquare, Calendar, FileText, RefreshCw, Plus, Users } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Task> | null;
  defaultLeadId?: string;
}

const PRIORITIES = [
  { value: 'low', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

const STATUSES: { value: Task['status']; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'done', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

type TemplateKey = 'call' | 'whatsapp' | 'visit' | 'meeting' | 'proposal' | 'followup' | 'custom';

const TEMPLATES: { key: TemplateKey; label: string; icon: any; title: string; description: string; priority: Task['priority']; offsetHours: number; appointmentType: Task['appointment_type'] }[] = [
  { key: 'call',     label: 'Ligar',             icon: Phone,         title: 'Ligar para o lead',          description: '',                                            priority: 'high',   offsetHours: 2,  appointmentType: 'call' },
  { key: 'whatsapp', label: 'Responder WhatsApp', icon: MessageSquare, title: 'Responder no WhatsApp',     description: '',                                            priority: 'high',   offsetHours: 1,  appointmentType: 'whatsapp' },
  { key: 'visit',    label: 'Agendar visita',    icon: Calendar,      title: 'Agendar visita ao imóvel',   description: 'Confirmar data/horário e enviar confirmação.', priority: 'high',   offsetHours: 24, appointmentType: 'visit' },
  { key: 'meeting',  label: 'Reunião',           icon: Users,         title: 'Reunião com o lead',         description: '',                                            priority: 'high',   offsetHours: 24, appointmentType: 'meeting' },
  { key: 'proposal', label: 'Enviar proposta',   icon: FileText,      title: 'Enviar proposta',            description: 'Preparar e enviar proposta personalizada.',    priority: 'urgent', offsetHours: 24, appointmentType: null },
  { key: 'followup', label: 'Cobrar retorno',    icon: RefreshCw,     title: 'Cobrar retorno do lead',     description: 'Lead sem resposta — fazer follow-up.',         priority: 'normal', offsetHours: 48, appointmentType: 'followup' },
  { key: 'custom',   label: 'Personalizada',    icon: Plus,           title: '',                            description: '',                                            priority: 'normal', offsetHours: 0,  appointmentType: null },
];

function formatLocalDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TaskFormDialog({ open, onClose, initial, defaultLeadId }: Props) {
  const { create, update } = useTaskMutations();
  const { user } = useAuth();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    due_at: '',
    priority: 'normal' as Task['priority'],
    status: 'pending' as Task['status'],
    assigned_to: '' as string,
    appointment_type: null as Task['appointment_type'],
  });
  const [agents, setAgents] = useState<{ user_id: string; full_name: string | null }[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: initial?.title || '',
      description: initial?.description || '',
      due_at: initial?.due_at ? initial.due_at.slice(0, 16) : '',
      priority: (initial?.priority as Task['priority']) || 'normal',
      status: (initial?.status as Task['status']) || 'pending',
      assigned_to: (initial?.assigned_to as string) || user?.id || '',
      appointment_type: (initial?.appointment_type as Task['appointment_type']) || null,
    });
    // Carrega corretores/agentes (uma vez por abertura)
    supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
      .limit(500)
      .then(({ data }) => setAgents((data as any) || []));
  }, [open, initial, user?.id]);

  function applyTemplate(key: TemplateKey) {
    const t = TEMPLATES.find((x) => x.key === key)!;
    if (key === 'custom') {
      setForm((f) => ({ ...f, title: '', description: '', due_at: '', priority: 'normal', appointment_type: null }));
      return;
    }
    const due = new Date(Date.now() + t.offsetHours * 3600 * 1000);
    setForm((f) => ({
      ...f,
      title: t.title,
      description: t.description || f.description,
      priority: t.priority,
      due_at: formatLocalDateTime(due),
      appointment_type: t.appointmentType,
    }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ title: 'Título obrigatório', variant: 'destructive' });
      return;
    }
    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      priority: form.priority,
      status: form.status,
      assigned_to: form.assigned_to || null,
      appointment_type: form.appointment_type,
      lead_id: initial?.lead_id ?? defaultLeadId ?? null,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: initial!.id!, ...payload });
        toast({ title: 'Tarefa atualizada' });
      } else {
        await create.mutateAsync(payload);
        toast({ title: 'Tarefa criada' });
      }
      onClose();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  }

  const saving = create.isPending || update.isPending;
  const showTemplates = !isEdit;

  const agentOptions = useMemo(() => {
    const me = agents.find((a) => a.user_id === user?.id);
    const others = agents.filter((a) => a.user_id !== user?.id);
    return [...(me ? [me] : []), ...others];
  }, [agents, user?.id]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {showTemplates && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Modelos rápidos</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Button
                      key={t.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-2 flex flex-col gap-1 text-[11px]"
                      onClick={() => applyTemplate(t.key)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="leading-tight">{t.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input
              value={form.title}
              maxLength={255}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Responsável</Label>
            <Select value={form.assigned_to || '__me__'} onValueChange={(v) => setForm((f) => ({ ...f, assigned_to: v === '__me__' ? user?.id || '' : v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__me__">Eu mesmo</SelectItem>
                {agentOptions.filter((a) => a.user_id !== user?.id).map((a) => (
                  <SelectItem key={a.user_id} value={a.user_id}>{a.full_name || 'Sem nome'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Vencimento</Label>
              <Input
                type="datetime-local"
                value={form.due_at}
                onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Task['priority'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de compromisso</Label>
            <Select
              value={form.appointment_type ?? '__none__'}
              onValueChange={(v) => setForm((f) => ({ ...f, appointment_type: v === '__none__' ? null : (v as Task['appointment_type']) }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum (tarefa comum)</SelectItem>
                <SelectItem value="visit">Visita</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="call">Ligação agendada</SelectItem>
                <SelectItem value="whatsapp">WhatsApp agendado</SelectItem>
                <SelectItem value="followup">Retorno</SelectItem>
              </SelectContent>
            </Select>
            {form.appointment_type && (
              <p className="text-[11px] text-muted-foreground">Aparece na agenda quando houver data/hora.</p>
            )}
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Task['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
