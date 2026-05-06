import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LEAD_FUNNEL_STAGES, LEAD_PRIORITY_OPTIONS } from '@/types/admin';
import type { AutomationRule } from '@/hooks/useEsteira';

interface Props { rule?: AutomationRule; onSaved: () => void }

const TRIGGER_EVENTS = [
  { value: 'lead_created', label: 'Lead criado' },
  { value: 'stage_changed', label: 'Mudança de estágio' },
  { value: 'assigned', label: 'Lead atribuído' },
];

const ACTIONS = [
  { value: 'create_task', label: 'Criar tarefa' },
  { value: 'notify_user', label: 'Notificar usuário' },
  { value: 'add_tag', label: 'Adicionar tag' },
  { value: 'set_priority', label: 'Definir prioridade' },
];

export function AutomationDialog({ rule, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<AutomationRule>>(
    rule || {
      name: '', is_active: true, trigger_event: 'stage_changed',
      action_type: 'create_task', action_config: { target: 'assignee' },
    }
  );
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('user_id, full_name').eq('is_active', true)
      .then(({ data }) => setMembers((data || []).map((p: any) => ({ id: p.user_id, name: p.full_name || 'Sem nome' }))));
  }, []);

  const updateCfg = (k: string, v: any) =>
    setForm({ ...form, action_config: { ...(form.action_config || {}), [k]: v } });

  const save = async () => {
    if (!form.name) { toast.error('Nome obrigatório'); return; }
    const { error } = await supabase.from('lead_automation_rules' as any).upsert(form as any);
    if (error) toast.error(error.message);
    else { toast.success('Automação salva'); setOpen(false); onSaved(); }
  };

  const cfg = form.action_config || {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {rule
          ? <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
          : <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova automação</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar automação' : 'Nova automação'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Quando</Label>
              <Select value={form.trigger_event} onValueChange={v => setForm({ ...form, trigger_event: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ação</Label>
              <Select value={form.action_type} onValueChange={v => setForm({ ...form, action_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.trigger_event === 'stage_changed' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>De estágio (opcional)</Label>
                <Select value={form.trigger_from_stage || 'any'}
                  onValueChange={v => setForm({ ...form, trigger_from_stage: v === 'any' ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    {LEAD_FUNNEL_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Para estágio</Label>
                <Select value={form.trigger_to_stage || 'any'}
                  onValueChange={v => setForm({ ...form, trigger_to_stage: v === 'any' ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    {LEAD_FUNNEL_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Config dinâmica por ação */}
          {(form.action_type === 'create_task' || form.action_type === 'notify_user') && (
            <>
              <div>
                <Label>Destinatário</Label>
                <Select value={cfg.target_user_id ? `u:${cfg.target_user_id}` : (cfg.target || 'assignee')}
                  onValueChange={v => {
                    if (v === 'assignee') updateCfg('target', 'assignee');
                    else if (v.startsWith('u:')) {
                      updateCfg('target_user_id', v.slice(2));
                      updateCfg('target', 'user');
                    }
                  }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignee">Corretor designado do lead</SelectItem>
                    {members.map(m => <SelectItem key={m.id} value={`u:${m.id}`}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título</Label>
                <Input value={cfg.title || ''} onChange={e => updateCfg('title', e.target.value)}
                  placeholder="Ex: Contatar lead {{name}}" />
              </div>
              <div>
                <Label>{form.action_type === 'create_task' ? 'Descrição' : 'Mensagem'}</Label>
                <Textarea value={cfg.description || cfg.message || ''}
                  onChange={e => updateCfg(form.action_type === 'create_task' ? 'description' : 'message', e.target.value)}
                  placeholder="Use {{name}}, {{stage}}, {{source}}" />
              </div>
              {form.action_type === 'create_task' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Prazo (horas)</Label>
                    <Input type="number" value={cfg.due_in_hours ?? ''}
                      onChange={e => updateCfg('due_in_hours', e.target.value ? Number(e.target.value) : null)} />
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Select value={cfg.priority || 'normal'} onValueChange={v => updateCfg('priority', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEAD_PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}

          {form.action_type === 'add_tag' && (
            <div>
              <Label>Tag a adicionar</Label>
              <Input value={cfg.tag || ''} onChange={e => updateCfg('tag', e.target.value)} />
            </div>
          )}

          {form.action_type === 'set_priority' && (
            <div>
              <Label>Prioridade</Label>
              <Select value={cfg.priority || 'normal'} onValueChange={v => updateCfg('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
            <Label>Ativa</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
