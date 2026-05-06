import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useDistributionRules, type DistributionRule } from '@/hooks/useDistributionRules';
import {
  useAutomationRules,
  useDistributionLogs,
  useEsteiraStats,
  useSlaConfig,
  useLeadsAtRisk,
} from '@/hooks/useEsteira';
import { AutomationDialog } from '@/components/admin/AutomationDialog';
import { SlaBadge } from '@/components/admin/SlaBadge';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  Activity, Clock, TrendingUp, AlertTriangle, Plus, Pencil, Trash2, Play, ListChecks,
} from 'lucide-react';
import { LEAD_SOURCE_OPTIONS, PROPERTY_TYPE_OPTIONS, PROPERTY_PURPOSE_OPTIONS } from '@/types/admin';

interface UserOpt { id: string; full_name: string }

function useTeamMembers() {
  const [members, setMembers] = useState<UserOpt[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('is_active', true);
      setMembers((data || []).map((p: any) => ({ id: p.user_id, full_name: p.full_name || 'Sem nome' })));
    })();
  }, []);
  return members;
}

function StatCard({ icon: Icon, label, value, hint, tone = 'default' }: any) {
  const toneClass = {
    default: 'text-foreground',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-destructive',
  }[tone as string];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
            {hint && <p className="text-xs text-muted-foreground mt-1 truncate">{hint}</p>}
          </div>
          <Icon className={`h-5 w-5 shrink-0 ${toneClass}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// =================== RULE FORM ===================
function RuleDialog({
  rule, onSaved, members,
}: { rule?: DistributionRule; onSaved: () => void; members: UserOpt[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<DistributionRule>>(rule || {
    name: '', priority: 100, is_active: true, mode: 'round_robin',
    match_sources: [], match_neighborhoods: [], match_property_types: [], match_purposes: [],
    eligible_user_ids: [], create_task: true, notify_assignee: true,
  });
  const { upsert } = useDistributionRules();

  const save = async () => {
    if (!form.name) { toast.error('Nome obrigatório'); return; }
    const { error } = await upsert(form);
    if (error) toast.error(error.message);
    else { toast.success('Regra salva'); setOpen(false); onSaved(); }
  };

  const toggleArr = (key: keyof DistributionRule, val: string) => {
    const arr = (form[key] as string[]) || [];
    setForm({ ...form, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {rule
          ? <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
          : <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova regra</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar regra' : 'Nova regra de distribuição'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Nome</Label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Prioridade (menor = primeiro)</Label>
              <Input type="number" value={form.priority || 100}
                onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <Label>Modo</Label>
            <Select value={form.mode} onValueChange={v => setForm({ ...form, mode: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="round_robin">Rodízio (round-robin)</SelectItem>
                <SelectItem value="manual_suggest">Manual com sugestão</SelectItem>
                <SelectItem value="property_owner">Corretor do imóvel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Origens (deixe vazio = todas)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {LEAD_SOURCE_OPTIONS.map(o => (
                <Badge key={o.value}
                  variant={form.match_sources?.includes(o.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArr('match_sources', o.value)}>
                  {o.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Tipos de imóvel</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROPERTY_TYPE_OPTIONS.map(o => (
                  <Badge key={o.value}
                    variant={form.match_property_types?.includes(o.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArr('match_property_types', o.value)}>
                    {o.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Finalidade</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROPERTY_PURPOSE_OPTIONS.map(o => (
                  <Badge key={o.value}
                    variant={form.match_purposes?.includes(o.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArr('match_purposes', o.value)}>
                    {o.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Faixa mín (R$)</Label>
              <Input type="number" value={form.min_price ?? ''}
                onChange={e => setForm({ ...form, min_price: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <Label>Faixa máx (R$)</Label>
              <Input type="number" value={form.max_price ?? ''}
                onChange={e => setForm({ ...form, max_price: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>

          <div>
            <Label>Bairros (separados por vírgula)</Label>
            <Input
              value={(form.match_neighborhoods || []).join(', ')}
              onChange={e => setForm({
                ...form,
                match_neighborhoods: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
              })} />
          </div>

          <div>
            <Label>Corretores elegíveis</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
              {members.map(m => (
                <Badge key={m.id}
                  variant={form.eligible_user_ids?.includes(m.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArr('eligible_user_ids', m.id)}>
                  {m.full_name}
                </Badge>
              ))}
              {members.length === 0 && <p className="text-xs text-muted-foreground">Sem membros ativos</p>}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
              <Label>Ativa</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.create_task} onCheckedChange={v => setForm({ ...form, create_task: v })} />
              <Label>Criar tarefa</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.notify_assignee} onCheckedChange={v => setForm({ ...form, notify_assignee: v })} />
              <Label>Notificar</Label>
            </div>
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

// =================== MAIN PAGE ===================
// =================== PANEL TAB (operational, realtime) ===================
function PanelTab() {
  const { categorized, loading, reload } = useLeadsAtRisk();

  const distribute = async (leadId: string, action: 'distribute' | 'redistribute') => {
    const { error } = await supabase.functions.invoke('lead-distributor', {
      body: { action, lead_id: leadId, reason: 'manual' },
    });
    if (error) toast.error(error.message);
    else { toast.success(action === 'distribute' ? 'Atribuído' : 'Redistribuído'); reload(); }
  };

  const Section = ({ title, leads, tone, action }: any) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">{leads.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {leads.length === 0 && <p className="text-xs text-muted-foreground">Nenhum lead nesta categoria.</p>}
        {leads.slice(0, 8).map((l: any) => (
          <div key={l.id} className="border rounded-md p-2 space-y-1">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{l.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {l.email} {l.phone && `· ${l.phone}`}
                </p>
              </div>
              <SlaBadge status={l.sla_status} distributedAt={l.distributed_at} firstResponseAt={l.first_response_at} />
            </div>
            <div className="flex gap-1 flex-wrap">
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <Link to={`/admin/leads/${l.id}`}>Abrir</Link>
              </Button>
              {!l.assigned_to && (
                <Button size="sm" variant="outline" className="h-8 text-xs"
                  onClick={() => distribute(l.id, 'distribute')}>
                  Atribuir
                </Button>
              )}
              {l.assigned_to && action === 'redistribute' && (
                <Button size="sm" variant="outline" className="h-8 text-xs"
                  onClick={() => distribute(l.id, 'redistribute')}>
                  Redistribuir
                </Button>
              )}
            </div>
          </div>
        ))}
        {leads.length > 8 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{leads.length - 8} outros leads
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return <p className="text-sm text-muted-foreground">Carregando painel…</p>;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Section title="Sem atribuição" leads={categorized.unassigned} tone="muted" action="distribute" />
      <Section title="SLA violado" leads={categorized.breached} tone="danger" action="redistribute" />
      <Section title="Em atenção" leads={categorized.warning} tone="warning" action="redistribute" />
      <Section title="Parados (24h+)" leads={categorized.stale} tone="muted" action="redistribute" />
    </div>
  );
}

export default function AdminEsteira() {
  const { rules, loading: lr, remove, toggle, reload } = useDistributionRules();
  const { stats, loading: ls } = useEsteiraStats();
  const { logs, loading: llogs, reload: reloadLogs } = useDistributionLogs(undefined, 100);
  const { configs, upsert: upsertSla } = useSlaConfig();
  const { rules: autoRules, toggle: toggleAuto, remove: removeAuto } = useAutomationRules();
  const members = useTeamMembers();
  const [running, setRunning] = useState(false);

  const runSlaCheck = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('lead-distributor', {
        body: { action: 'check_sla' },
      });
      if (error) throw error;
      toast.success(`Checagem concluída: ${data?.processed ?? 0} leads avaliados`);
      reloadLogs();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setRunning(false); }
  };

  const sla = configs[0];

  return (
    <>
      <Helmet><title>Esteira de Leads | Admin</title></Helmet>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Esteira de Leads</h1>
            <p className="text-sm text-muted-foreground">Distribuição inteligente, SLA e automações</p>
          </div>
          <Button onClick={runSlaCheck} disabled={running} size="sm">
            <Play className="h-4 w-4 mr-1" />
            {running ? 'Executando…' : 'Executar checagem'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={ListChecks} label="Leads (30d)" value={ls ? '…' : stats.total} />
          <StatCard icon={Activity} label="Distribuídos" value={ls ? '…' : stats.distributed} />
          <StatCard icon={TrendingUp} label="Taxa atend." value={ls ? '…' : `${stats.answerRate}%`} tone="success" />
          <StatCard icon={Clock} label="Tempo médio" value={ls ? '…' : `${stats.avgResponseMin}min`} />
          <StatCard icon={AlertTriangle} label="SLA violado" value={ls ? '…' : stats.breached} tone="danger" />
        </div>

        <Tabs defaultValue="panel" className="space-y-4">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex">
              <TabsTrigger value="panel">Painel</TabsTrigger>
              <TabsTrigger value="rules">Regras</TabsTrigger>
              <TabsTrigger value="sla">SLA</TabsTrigger>
              <TabsTrigger value="automation">Automações</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </div>

          {/* ============ PANEL (operational, realtime) ============ */}
          <TabsContent value="panel" className="space-y-4">
            <PanelTab />
          </TabsContent>

          {/* ============ RULES ============ */}
          <TabsContent value="rules" className="space-y-3">
            <div className="flex justify-end">
              <RuleDialog onSaved={reload} members={members} />
            </div>
            {lr && <p className="text-sm text-muted-foreground">Carregando…</p>}
            {!lr && rules.length === 0 && (
              <Card><CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma regra criada. Crie a primeira para iniciar a distribuição automática.
              </CardContent></Card>
            )}
            <div className="space-y-2">
              {rules.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{r.name}</span>
                          <Badge variant="outline">P{r.priority}</Badge>
                          <Badge>{r.mode}</Badge>
                          {!r.is_active && <Badge variant="secondary">inativa</Badge>}
                        </div>
                        {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          {r.match_sources?.length > 0 && <p>Origens: {r.match_sources.join(', ')}</p>}
                          {r.match_neighborhoods?.length > 0 && <p>Bairros: {r.match_neighborhoods.join(', ')}</p>}
                          {r.match_property_types?.length > 0 && <p>Tipos: {r.match_property_types.join(', ')}</p>}
                          {(r.min_price || r.max_price) && (
                            <p>Faixa: R$ {r.min_price || 0} – {r.max_price || '∞'}</p>
                          )}
                          <p>{r.eligible_user_ids?.length || 0} corretor(es) elegível(is)</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Switch checked={r.is_active} onCheckedChange={v => toggle(r.id, v)} />
                        <div className="flex">
                          <RuleDialog rule={r} onSaved={reload} members={members} />
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={async () => {
                              if (confirm(`Excluir regra "${r.name}"?`)) {
                                const { error } = await remove(r.id);
                                if (error) toast.error(error.message);
                                else toast.success('Excluída');
                              }
                            }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ============ SLA ============ */}
          <TabsContent value="sla">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuração de SLA</CardTitle>
                <CardDescription>Tempos máximos para resposta a um lead novo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sla ? (
                  <>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <Label>1ª resposta (min)</Label>
                        <Input type="number" defaultValue={sla.first_response_minutes}
                          onBlur={e => upsertSla({ ...sla, first_response_minutes: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label>Aviso prévio (min)</Label>
                        <Input type="number" defaultValue={sla.warning_minutes}
                          onBlur={e => upsertSla({ ...sla, warning_minutes: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label>Sem interação (h)</Label>
                        <Input type="number" defaultValue={sla.no_interaction_hours}
                          onBlur={e => upsertSla({ ...sla, no_interaction_hours: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div>
                      <Label>Ações ao violar</Label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {['notify', 'task', 'redistribute'].map(a => (
                          <Badge key={a}
                            variant={sla.on_breach_actions?.includes(a) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const next = sla.on_breach_actions?.includes(a)
                                ? sla.on_breach_actions.filter(x => x !== a)
                                : [...(sla.on_breach_actions || []), a];
                              upsertSla({ ...sla, on_breach_actions: next });
                            }}>
                            {a === 'notify' ? 'Notificar' : a === 'task' ? 'Criar tarefa' : 'Redistribuir'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cron ativo a cada 5 minutos. Alterações salvam ao sair do campo.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma configuração de SLA encontrada.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ AUTOMATION ============ */}
          <TabsContent value="automation" className="space-y-3">
            <div className="flex justify-end">
              <AutomationDialog onSaved={() => window.location.reload()} />
            </div>
            {autoRules.length === 0 && (
              <Card><CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma automação configurada. Crie a primeira para reagir automaticamente a eventos.
              </CardContent></Card>
            )}
            {autoRules.map(a => (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.trigger_event}
                      {a.trigger_to_stage ? ` → ${a.trigger_to_stage}` : ''}
                      {' · '}{a.action_type}
                    </p>
                    {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch checked={a.is_active} onCheckedChange={v => toggleAuto(a.id, v)} />
                    <AutomationDialog rule={a} onSaved={() => window.location.reload()} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      if (confirm(`Excluir automação "${a.name}"?`)) removeAuto(a.id);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ============ LOGS ============ */}
          <TabsContent value="logs">
            {llogs && <p className="text-sm text-muted-foreground">Carregando…</p>}
            {!llogs && logs.length === 0 && (
              <Card><CardContent className="p-6 text-center text-muted-foreground">
                Nenhum log ainda. Logs aparecem assim que regras forem aplicadas.
              </CardContent></Card>
            )}
            <Accordion type="multiple" className="space-y-2">
              {logs.map(l => (
                <AccordionItem key={l.id} value={l.id} className="border rounded-md px-3 bg-card">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2 flex-wrap text-left">
                      <Badge variant={
                        l.action === 'assigned' ? 'default'
                        : l.action === 'redistributed' ? 'secondary'
                        : l.action === 'no_match' ? 'outline' : 'destructive'
                      }>{l.action}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(l.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-1 pb-3">
                    <p><strong>Lead:</strong> {l.lead_id.slice(0, 8)}…</p>
                    {l.reason && <p><strong>Motivo:</strong> {l.reason}</p>}
                    {l.assigned_user_id && <p><strong>Atribuído:</strong> {l.assigned_user_id.slice(0, 8)}…</p>}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
