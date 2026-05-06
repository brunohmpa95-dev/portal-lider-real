import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDistributionRules, type DistributionRule } from '@/hooks/useDistributionRules';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Pencil, Users, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/admin/StateViews';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MODE_LABEL: Record<string, string> = {
  round_robin: 'Rodízio simples',
  property_owner: 'Corretor do imóvel',
  manual_suggest: 'Sugestão manual',
};

const SOURCES = ['website', 'whatsapp', 'phone', 'referral', 'social', 'portal', 'walk_in', 'other'];
const PURPOSES = ['sale', 'rent'];
const PROPERTY_TYPES = ['casa', 'apartamento', 'terreno', 'comercial', 'rural'];

interface AgentOption { user_id: string; full_name: string | null }

const empty: Partial<DistributionRule> = {
  name: '',
  description: '',
  is_active: true,
  priority: 100,
  mode: 'round_robin',
  match_sources: [],
  match_neighborhoods: [],
  match_property_types: [],
  match_purposes: [],
  eligible_user_ids: [],
  notify_assignee: true,
  create_task: true,
  min_price: null,
  max_price: null,
};

export default function AdminDistributionRules() {
  const { rules, loading, upsert, remove, toggle, reload } = useDistributionRules();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<DistributionRule>>(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<DistributionRule | null>(null);

  useEffect(() => {
    supabase.from('profiles').select('user_id, full_name').eq('is_active', true).order('full_name')
      .then(({ data }) => setAgents((data as any) || []));
  }, []);

  function openNew() { setEditing({ ...empty }); setOpen(true); }
  function openEdit(r: DistributionRule) { setEditing({ ...r }); setOpen(true); }

  function toggleArr(field: keyof DistributionRule, value: string) {
    const arr = ((editing as any)[field] || []) as string[];
    setEditing({ ...editing, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  }

  async function save() {
    if (!editing.name?.trim()) { toast({ title: 'Nome obrigatório', variant: 'destructive' }); return; }
    if (editing.mode === 'round_robin' && !(editing.eligible_user_ids?.length)) {
      toast({ title: 'Selecione corretores elegíveis para o rodízio', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload: any = {
      ...editing,
      min_price: editing.min_price ? Number(editing.min_price) : null,
      max_price: editing.max_price ? Number(editing.max_price) : null,
      priority: Number(editing.priority) || 100,
    };
    const { error } = await upsert(payload);
    setSaving(false);
    if (error) { toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Regra salva' });
    setOpen(false);
    reload();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const { error } = await remove(deleting.id);
    setDeleting(null);
    if (error) toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    else toast({ title: 'Regra excluída' });
  }

  return (
    <div>
      <InternalPageHeader
        title="Regras de Distribuição de Leads"
        subtitle="Configure como leads são atribuídos a corretores automaticamente"
      />

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          As regras são avaliadas por prioridade (menor número primeiro). A primeira que combinar é aplicada.
        </p>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova regra</Button>
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : rules.length === 0 ? (
        <Card><CardContent className="p-0">
          <EmptyState
            icon={<Settings2 className="h-6 w-6" />}
            title="Nenhuma regra cadastrada"
            description="Sem regras, leads ficam sem atribuição automática. Crie a primeira regra de distribuição."
            action={<Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova regra</Button>}
          />
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">#{r.priority}</Badge>
                      <h3 className="font-semibold">{r.name}</h3>
                      <Badge variant={r.is_active ? 'default' : 'secondary'}>{r.is_active ? 'Ativa' : 'Inativa'}</Badge>
                      <Badge variant="outline">{MODE_LABEL[r.mode] || r.mode}</Badge>
                    </div>
                    {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                    <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {r.match_sources?.length > 0 && <span>Origem: {r.match_sources.join(', ')}</span>}
                      {r.match_purposes?.length > 0 && <span>Finalidade: {r.match_purposes.join(', ')}</span>}
                      {r.match_property_types?.length > 0 && <span>Tipo: {r.match_property_types.join(', ')}</span>}
                      {r.match_neighborhoods?.length > 0 && <span>Bairros: {r.match_neighborhoods.join(', ')}</span>}
                      {(r.min_price || r.max_price) && <span>Preço: {r.min_price || 0} → {r.max_price || '∞'}</span>}
                      {r.mode === 'round_robin' && <span><Users className="h-3 w-3 inline mr-1" />{r.eligible_user_ids?.length || 0} corretores</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(r)} aria-label="Excluir">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.id ? 'Editar regra' : 'Nova regra'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Nome *</Label>
                <Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Input type="number" value={editing.priority || 100} onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea rows={2} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>Modo</Label>
              <Select value={editing.mode} onValueChange={(v) => setEditing({ ...editing, mode: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Rodízio simples (alterna entre corretores elegíveis)</SelectItem>
                  <SelectItem value="property_owner">Corretor do imóvel (responsável cadastrado)</SelectItem>
                  <SelectItem value="manual_suggest">Sugestão manual (não atribui, só sugere)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(editing.mode === 'round_robin' || editing.mode === 'manual_suggest') && (
              <div className="space-y-1.5">
                <Label>Corretores elegíveis</Label>
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                  {agents.map((a) => {
                    const checked = (editing.eligible_user_ids || []).includes(a.user_id);
                    return (
                      <label key={a.user_id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const arr = editing.eligible_user_ids || [];
                            setEditing({
                              ...editing,
                              eligible_user_ids: checked ? arr.filter((u) => u !== a.user_id) : [...arr, a.user_id],
                            });
                          }}
                        />
                        {a.full_name || a.user_id.slice(0, 8)}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t pt-3 space-y-3">
              <p className="text-sm font-semibold">Critérios (deixe vazio = aceita qualquer)</p>

              <div className="space-y-1.5">
                <Label className="text-xs">Origem</Label>
                <div className="flex flex-wrap gap-1">
                  {SOURCES.map((s) => (
                    <Badge key={s} variant={(editing.match_sources || []).includes(s) ? 'default' : 'outline'}
                           className="cursor-pointer" onClick={() => toggleArr('match_sources', s)}>{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Finalidade</Label>
                <div className="flex flex-wrap gap-1">
                  {PURPOSES.map((s) => (
                    <Badge key={s} variant={(editing.match_purposes || []).includes(s) ? 'default' : 'outline'}
                           className="cursor-pointer" onClick={() => toggleArr('match_purposes', s)}>{s === 'sale' ? 'Venda' : 'Aluguel'}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de imóvel</Label>
                <div className="flex flex-wrap gap-1">
                  {PROPERTY_TYPES.map((s) => (
                    <Badge key={s} variant={(editing.match_property_types || []).includes(s) ? 'default' : 'outline'}
                           className="cursor-pointer" onClick={() => toggleArr('match_property_types', s)}>{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Bairros (separados por vírgula)</Label>
                <Input
                  value={(editing.match_neighborhoods || []).join(', ')}
                  onChange={(e) => setEditing({
                    ...editing,
                    match_neighborhoods: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })}
                  placeholder="Centro, Vila Real..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Preço mínimo</Label>
                  <Input type="number" value={editing.min_price ?? ''} onChange={(e) => setEditing({ ...editing, min_price: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Preço máximo</Label>
                  <Input type="number" value={editing.max_price ?? ''} onChange={(e) => setEditing({ ...editing, max_price: e.target.value ? Number(e.target.value) : null })} />
                </div>
              </div>
            </div>

            <div className="border-t pt-3 grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={editing.notify_assignee ?? true} onCheckedChange={(v) => setEditing({ ...editing, notify_assignee: v })} />
                Notificar responsável
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={editing.create_task ?? true} onCheckedChange={(v) => setEditing({ ...editing, create_task: v })} />
                Criar tarefa de follow-up
              </label>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              Ativa
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
