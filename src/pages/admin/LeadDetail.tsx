import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  LEAD_FUNNEL_STAGES, LEAD_PRIORITY_OPTIONS, LEAD_SOURCE_OPTIONS, LEAD_TEMPERATURE_OPTIONS,
  LEAD_CHANNEL_OPTIONS, INTERACTION_TYPE_OPTIONS,
  PROPERTY_PURPOSE_OPTIONS, PROPERTY_TYPE_OPTIONS,
} from '@/types/admin';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { useTasks, useTaskMutations } from '@/hooks/useTasks';
import LostReasonDialog from '@/components/admin/LostReasonDialog';
import TaskFormDialog from '@/components/admin/TaskFormDialog';
import QuickInteractionDialog from '@/components/admin/QuickInteractionDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, Plus, Loader2, Phone, Mail, MessageSquare, AlertCircle, Calendar,
  RefreshCw, User, Flame, MoveRight, CalendarPlus, ListTodo, FileText, Sparkles,
  CheckCircle2, XCircle, UserCheck, ArrowRightLeft,
} from 'lucide-react';
import { SlaBadge } from '@/components/admin/SlaBadge';
import { temperatureColor, funnelStageColor, channelLabel, sourceLabel } from '@/lib/leads';

const NONE = '__none__';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: neighborhoods = [] } = useNeighborhoods();
  const { data: tasks = [] } = useTasks({ leadId: id });
  const { update: updateTask } = useTaskMutations();

  const [lead, setLead] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [distLogs, setDistLogs] = useState<any[]>([]);
  const [slaEvents, setSlaEvents] = useState<any[]>([]);
  const [agents, setAgents] = useState<{ user_id: string; full_name: string | null }[]>([]);
  const [property, setProperty] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingLost, setPendingLost] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editInterest, setEditInterest] = useState(false);
  const [interactionDefaultType, setInteractionDefaultType] =
    useState<null | 'note' | 'call' | 'whatsapp' | 'visit' | 'meeting' | 'email'>(null);

  useEffect(() => { if (id) loadLead(); }, [id]);

  async function loadLead() {
    setLoading(true);
    const [leadRes, intRes, distRes, slaRes, agentsRes, visitsRes] = await Promise.all([
      supabase.from('property_leads').select('*').eq('id', id!).single(),
      supabase.from('lead_interactions' as any).select('*').eq('lead_id', id!).order('created_at', { ascending: false }),
      supabase.from('lead_distribution_logs' as any).select('*').eq('lead_id', id!).order('created_at', { ascending: false }).limit(50),
      supabase.from('lead_sla_events' as any).select('*').eq('lead_id', id!).order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('user_id, full_name').eq('is_active', true).order('full_name'),
      supabase.from('visits' as any).select('id, scheduled_at, duration_minutes, status, notes').eq('lead_id', id!).order('scheduled_at', { ascending: true }),
    ]);
    if (leadRes.data) {
      setLead(leadRes.data);
      if ((leadRes.data as any).property_id) {
        const { data: prop } = await supabase
          .from('properties')
          .select('id, code, title, neighborhood, price, purpose, type')
          .eq('id', (leadRes.data as any).property_id)
          .maybeSingle();
        setProperty(prop);
      } else {
        setProperty(null);
      }
    }
    setInteractions((intRes as any).data || []);
    setDistLogs((distRes as any).data || []);
    setSlaEvents((slaRes as any).data || []);
    setAgents((agentsRes.data as any) || []);
    setVisits(((visitsRes as any).data) || []);
    setLoading(false);
  }

  async function updateField(field: string, value: any) {
    const patch = { [field]: value } as any;
    const { error } = await supabase.from('property_leads').update(patch).eq('id', id!);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else {
      setLead((prev: any) => ({ ...prev, [field]: value }));
      toast({ title: 'Atualizado' });
    }
  }

  async function handleStageChange(value: string) {
    if (value === 'lost') { setPendingLost(true); return; }
    await updateField('funnel_stage', value);
  }

  async function confirmLost(reasonId: string, notes: string) {
    const { error } = await supabase.from('property_leads').update({
      funnel_stage: 'lost', lost_reason_id: reasonId, lost_notes: notes || null,
    } as any).eq('id', id!);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Lead marcado como perdido' }); loadLead(); }
    setPendingLost(false);
  }

  async function saveInterest(patch: any) {
    const { error } = await supabase.from('property_leads').update(patch as any).eq('id', id!);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { setLead((p: any) => ({ ...p, ...patch })); setEditInterest(false); toast({ title: 'Interesse atualizado' }); }
  }

  async function forceRedistribute() {
    if (!confirm('Forçar redistribuição deste lead?')) return;
    const { error } = await supabase.functions.invoke('lead-distributor', {
      body: { action: 'redistribute', lead_id: id, reason: 'manual_force' },
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Redistribuído' }); loadLead(); }
  }

  // ==== Timeline unificada ====
  type TimelineEvent = {
    id: string;
    when: string;
    icon: React.ReactNode;
    title: string;
    detail?: string;
    color: string;
    kind: 'created' | 'distribution' | 'sla' | 'interaction' | 'task' | 'lost';
    interactionType?: string;
  };

  const OUTCOME_LABEL: Record<string, string> = {
    sucesso: 'Sucesso / contato efetivo',
    sem_resposta: 'Sem resposta',
    reagendar: 'Reagendar',
    interessado: 'Interessado',
    nao_interessado: 'Não interessado',
    aguardando_cliente: 'Aguardando cliente',
  };

  const timeline: TimelineEvent[] = useMemo(() => {
    if (!lead) return [];
    const ev: TimelineEvent[] = [];

    ev.push({
      id: 'created', when: lead.created_at, kind: 'created',
      icon: <Sparkles className="h-3.5 w-3.5" />, title: 'Lead criado',
      detail: lead.source ? `Origem: ${sourceLabel(lead.source)}` : undefined,
      color: 'bg-blue-100 text-blue-700',
    });

    distLogs.forEach((d) => {
      const titleMap: Record<string, string> = {
        assigned: 'Corretor atribuído',
        redistributed: 'Lead redistribuído',
        manual_suggest: 'Sugestão manual de atribuição',
        no_match: 'Sem regra correspondente',
      };
      ev.push({
        id: `dist-${d.id}`, when: d.created_at, kind: 'distribution',
        icon: <UserCheck className="h-3.5 w-3.5" />,
        title: titleMap[d.action] || d.action,
        detail: d.reason || undefined,
        color: 'bg-violet-100 text-violet-700',
      });
    });

    slaEvents.forEach((s) => {
      const breach = s.event_type?.includes('breach');
      ev.push({
        id: `sla-${s.id}`, when: s.created_at, kind: 'sla',
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        title: `SLA: ${s.event_type}`,
        color: breach ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
      });
    });

    interactions.forEach((i) => {
      const label = INTERACTION_TYPE_OPTIONS.find((o) => o.value === i.interaction_type)?.label || i.interaction_type;
      const iconMap: Record<string, React.ReactNode> = {
        call: <Phone className="h-3.5 w-3.5" />,
        whatsapp: <MessageSquare className="h-3.5 w-3.5" />,
        email: <Mail className="h-3.5 w-3.5" />,
        visit: <Calendar className="h-3.5 w-3.5" />,
        meeting: <User className="h-3.5 w-3.5" />,
        note: <FileText className="h-3.5 w-3.5" />,
        stage_change: <MoveRight className="h-3.5 w-3.5" />,
      };
      const isStage = i.interaction_type === 'stage_change';
      // Compõe detalhe enriquecido
      const parts: string[] = [];
      if (i.content) parts.push(i.content);
      if (i.outcome) parts.push(`Resultado: ${OUTCOME_LABEL[i.outcome] || i.outcome}`);
      if (i.next_step) {
        const when = i.next_step_at
          ? ` (até ${new Date(i.next_step_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })})`
          : '';
        parts.push(`Próximo passo: ${i.next_step}${when}`);
      }
      if (i.funnel_stage_at_time && !isStage) {
        const stageLbl = LEAD_FUNNEL_STAGES.find((s) => s.value === i.funnel_stage_at_time)?.label;
        if (stageLbl) parts.push(`Etapa: ${stageLbl}`);
      }
      ev.push({
        id: `int-${i.id}`, when: i.created_at, kind: 'interaction',
        interactionType: i.interaction_type,
        icon: iconMap[i.interaction_type] || <FileText className="h-3.5 w-3.5" />,
        title: label,
        detail: parts.length ? parts.join('\n') : undefined,
        color: isStage ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700',
      });
    });

    tasks.filter((t) => t.status === 'done' && t.completed_at).forEach((t) => {
      ev.push({
        id: `task-done-${t.id}`, when: t.completed_at!, kind: 'task',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        title: `Tarefa concluída: ${t.title}`,
        color: 'bg-green-100 text-green-700',
      });
    });

    if (lead.funnel_stage === 'lost' && lead.lost_at) {
      ev.push({
        id: 'lost', when: lead.lost_at, kind: 'lost',
        icon: <XCircle className="h-3.5 w-3.5" />,
        title: 'Lead marcado como perdido',
        detail: lead.lost_notes || undefined,
        color: 'bg-red-100 text-red-700',
      });
    }

    return ev.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  }, [lead, distLogs, slaEvents, interactions, tasks]);

  // Filtros do histórico
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState<string>('all');

  const filteredTimeline = useMemo(() => {
    const now = Date.now();
    const periodMs: Record<string, number | null> = {
      all: null, '7d': 7 * 86400000, '30d': 30 * 86400000, '90d': 90 * 86400000,
    };
    const cutoff = periodMs[historyPeriodFilter];
    return timeline.filter((e) => {
      if (historyTypeFilter !== 'all') {
        if (historyTypeFilter === 'system') {
          if (e.kind === 'interaction') return false;
        } else {
          if (e.kind !== 'interaction' || e.interactionType !== historyTypeFilter) return false;
        }
      }
      if (cutoff && new Date(e.when).getTime() < now - cutoff) return false;
      return true;
    });
  }, [timeline, historyTypeFilter, historyPeriodFilter]);


  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!lead) return <div className="text-center py-12 text-muted-foreground">Lead não encontrado</div>;

  const followupOverdue = lead.next_followup_at && new Date(lead.next_followup_at) < new Date();
  const interestNbName = neighborhoods.find((n) => n.id === lead.interest_neighborhood_id)?.name;
  const fmtPrice = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v) : '—';
  const assignedAgent = agents.find((a) => a.user_id === lead.assigned_to);
  const waNumber = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');

  return (
    <div className="space-y-4 max-w-6xl">
      {/* ==== HEADER ==== */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/leads')} aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold truncate flex-1">{lead.name}</h1>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`${funnelStageColor(lead.funnel_stage)}`}>
              {LEAD_FUNNEL_STAGES.find((s) => s.value === lead.funnel_stage)?.label || lead.funnel_stage}
            </Badge>
            <Badge variant="outline" className={temperatureColor(lead.temperature)}>
              <Flame className="h-3 w-3 mr-1" />
              {LEAD_TEMPERATURE_OPTIONS.find((t) => t.value === lead.temperature)?.label || 'Frio'}
            </Badge>
            {lead.source && <Badge variant="secondary">{sourceLabel(lead.source)}</Badge>}
            {lead.channel && <Badge variant="outline">{channelLabel(lead.channel)}</Badge>}
            <SlaBadge status={lead.sla_status} distributedAt={lead.distributed_at} firstResponseAt={lead.first_response_at} />
            {lead.next_followup_at && (
              <Badge variant={followupOverdue ? 'destructive' : 'outline'} className="gap-1">
                <Calendar className="h-3 w-3" />
                Follow-up {new Date(lead.next_followup_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="min-w-0">
              <Label className="text-xs text-muted-foreground">E-mail</Label>
              <a href={`mailto:${lead.email}`} className="block font-medium truncate text-primary hover:underline">{lead.email}</a>
            </div>
            <div className="min-w-0">
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="font-medium truncate">{lead.phone || '—'}</p>
            </div>
            <div className="min-w-0">
              <Label className="text-xs text-muted-foreground">WhatsApp</Label>
              <p className="font-medium truncate">{lead.whatsapp || (lead.phone ? `${lead.phone} *` : '—')}</p>
            </div>
            <div className="min-w-0">
              <Label className="text-xs text-muted-foreground">Corretor responsável</Label>
              <Select value={lead.assigned_to || NONE} onValueChange={(v) => updateField('assigned_to', v === NONE ? null : v)}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Sem corretor" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value={NONE}>Sem corretor</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.user_id} value={a.user_id}>{a.full_name || 'Sem nome'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações rápidas no header */}
          <div className="flex flex-wrap gap-2 pt-1">
            {waNumber && (
              <Button size="sm" variant="outline" asChild>
                <a href={`https://wa.me/55${waNumber}`} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4 mr-1" /> Abrir WhatsApp
                </a>
              </Button>
            )}
            {lead.phone && (
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${lead.phone}`}><Phone className="h-4 w-4 mr-1" /> Ligar</a>
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setInteractionDefaultType('call')}>
              <Phone className="h-4 w-4 mr-1" /> Registrar ligação
            </Button>
            <Button size="sm" variant="outline" onClick={() => setInteractionDefaultType('whatsapp')}>
              <MessageSquare className="h-4 w-4 mr-1" /> Registrar WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => setInteractionDefaultType('visit')}>
              <CalendarPlus className="h-4 w-4 mr-1" /> Registrar visita
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTaskDialogOpen(true)}>
              <ListTodo className="h-4 w-4 mr-1" /> Criar tarefa
            </Button>
            <Button size="sm" variant="outline" onClick={forceRedistribute}>
              <ArrowRightLeft className="h-4 w-4 mr-1" /> Redistribuir
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Imóvel de interesse vinculado */}
          {property && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Imóvel relacionado</CardTitle></CardHeader>
              <CardContent>
                <Link to={`/admin/properties/${property.id}`} className="block hover:bg-muted/50 -m-2 p-2 rounded">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{property.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {property.code} · {property.neighborhood || '—'} · {property.purpose === 'rent' ? 'Aluguel' : 'Venda'}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{fmtPrice(property.price)}</Badge>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Interesse */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Interesse do cliente</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditInterest((v) => !v)}>
                {editInterest ? 'Cancelar' : 'Editar'}
              </Button>
            </CardHeader>
            <CardContent>
              {!editInterest ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label className="text-xs text-muted-foreground">Finalidade</Label><p>{PROPERTY_PURPOSE_OPTIONS.find((o) => o.value === lead.interest_purpose)?.label || '—'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Tipo</Label><p>{PROPERTY_TYPE_OPTIONS.find((o) => o.value === lead.interest_property_type)?.label || '—'}</p></div>
                  <div className="col-span-2"><Label className="text-xs text-muted-foreground">Bairro</Label><p>{interestNbName || '—'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Faixa</Label><p>{fmtPrice(lead.interest_min_price)} – {fmtPrice(lead.interest_max_price)}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Quartos mín</Label><p>{lead.interest_bedrooms ?? '—'}</p></div>
                </div>
              ) : (
                <InterestEditor lead={lead} neighborhoods={neighborhoods} onSave={saveInterest} />
              )}
            </CardContent>
          </Card>

          {/* Próximos compromissos (agenda) */}
          {(() => {
            const now = Date.now();
            const upcomingVisits = visits
              .filter((v) => v.status === 'scheduled' && new Date(v.scheduled_at).getTime() >= now)
              .map((v) => ({ id: v.id, kind: 'Visita', when: v.scheduled_at, note: v.notes as string | null }));
            const upcomingTasks = (tasks as any[])
              .filter((t) => t.appointment_type && t.due_at && t.status === 'pending' && new Date(t.due_at).getTime() >= now)
              .map((t) => ({
                id: t.id,
                kind:
                  t.appointment_type === 'visit' ? 'Visita' :
                  t.appointment_type === 'meeting' ? 'Reunião' :
                  t.appointment_type === 'call' ? 'Ligação' :
                  t.appointment_type === 'whatsapp' ? 'WhatsApp' : 'Retorno',
                when: t.due_at,
                note: t.title as string,
              }));
            const all = [...upcomingVisits, ...upcomingTasks].sort((a, b) => +new Date(a.when) - +new Date(b.when)).slice(0, 6);
            if (all.length === 0) return null;
            return (
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Próximos compromissos</CardTitle>
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                    <Link to="/admin/agenda">Ver agenda</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {all.map((c) => (
                      <li key={`${c.kind}-${c.id}`} className="flex items-start gap-2 p-2 rounded border">
                        <Badge variant="outline" className="text-[10px] shrink-0">{c.kind}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{c.note || c.kind}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(c.when).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })()}

          {/* Tarefas */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Tarefas vinculadas</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setTaskDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Nova
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-2 p-2 rounded border">
                      <Checkbox
                        checked={t.status === 'done'}
                        onCheckedChange={() => updateTask.mutate({ id: t.id, status: t.status === 'done' ? 'pending' : 'done' })}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                        {t.due_at && <p className="text-[11px] text-muted-foreground">Vence {new Date(t.due_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {(lead.message || lead.internal_notes || lead.funnel_stage === 'lost') && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Observações</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {lead.message && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Mensagem do lead</Label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">{lead.message}</p>
                  </div>
                )}
                {lead.internal_notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Notas internas</Label>
                    <p className="text-sm mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg whitespace-pre-wrap">{lead.internal_notes}</p>
                  </div>
                )}
                {lead.funnel_stage === 'lost' && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Motivo da perda</Label>
                    {lead.lost_notes && <p className="text-sm mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">{lead.lost_notes}</p>}
                    {lead.lost_at && <p className="text-[11px] text-muted-foreground mt-1">Em {new Date(lead.lost_at).toLocaleString('pt-BR')}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TIMELINE UNIFICADA */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base">Histórico</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setInteractionDefaultType('note')}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                  <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    <SelectItem value="system">Apenas sistema</SelectItem>
                    {INTERACTION_TYPE_OPTIONS.filter((o) => o.value !== 'stage_change').map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={historyPeriodFilter} onValueChange={setHistoryPeriodFilter}>
                  <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer data</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground ml-auto">
                  {filteredTimeline.length} de {timeline.length}
                </span>
              </div>
              {filteredTimeline.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento</p>
              ) : (
                <ol className="relative border-l border-border ml-2 space-y-4">
                  {filteredTimeline.map((e) => (
                    <li key={e.id} className="ml-4">
                      <span className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background ${e.color}`}>
                        {e.icon}
                      </span>
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium">{e.title}</p>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {new Date(e.when).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {e.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap break-words">
                          {e.detail}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Status & próximas ações</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Etapa do funil</Label>
                <Select value={lead.funnel_stage} onValueChange={handleStageChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_FUNNEL_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Temperatura</Label>
                <Select value={lead.temperature || 'cold'} onValueChange={(v) => updateField('temperature', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_TEMPERATURE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prioridade</Label>
                <Select value={lead.priority} onValueChange={(v) => updateField('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_PRIORITY_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Próximo follow-up</Label>
                <Input
                  type="datetime-local"
                  value={lead.next_followup_at ? new Date(lead.next_followup_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateField('next_followup_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <span>SLA & Distribuição</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={forceRedistribute} title="Redistribuir">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex flex-wrap gap-2 items-center">
                <SlaBadge status={lead.sla_status} distributedAt={lead.distributed_at} firstResponseAt={lead.first_response_at} />
                {lead.redistribution_count > 0 && (
                  <Badge variant="outline">Redistribuído {lead.redistribution_count}x</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Distribuído: {lead.distributed_at ? new Date(lead.distributed_at).toLocaleString('pt-BR') : '—'}
              </p>
              <p className="text-muted-foreground">
                1ª resposta: {lead.first_response_at ? new Date(lead.first_response_at).toLocaleString('pt-BR') : '—'}
              </p>
              <p className="text-muted-foreground">
                Última interação: {lead.last_interaction_at ? new Date(lead.last_interaction_at).toLocaleString('pt-BR') : '—'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Mover etapa</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {LEAD_FUNNEL_STAGES.filter((s) => s.value !== lead.funnel_stage).map((s) => (
                <Button key={s.value} variant="outline" size="sm" className="justify-start text-xs" onClick={() => handleStageChange(s.value)}>
                  <MoveRight className="h-3.5 w-3.5 mr-1" /> {s.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <LostReasonDialog
        open={pendingLost}
        leadName={lead.name}
        onCancel={() => setPendingLost(false)}
        onConfirm={confirmLost}
      />
      <TaskFormDialog open={taskDialogOpen} onClose={() => { setTaskDialogOpen(false); }} defaultLeadId={id} />
      <QuickInteractionDialog
        leadId={id || null}
        leadName={lead.name}
        open={!!interactionDefaultType}
        onOpenChange={(o) => { if (!o) setInteractionDefaultType(null); }}
        defaultType={interactionDefaultType || 'note'}
        onDone={loadLead}
      />
    </div>
  );
}

function InterestEditor({ lead, neighborhoods, onSave }: { lead: any; neighborhoods: any[]; onSave: (p: any) => void }) {
  const [s, setS] = useState({
    interest_purpose: lead.interest_purpose || '',
    interest_property_type: lead.interest_property_type || '',
    interest_neighborhood_id: lead.interest_neighborhood_id || '',
    interest_min_price: lead.interest_min_price ?? '',
    interest_max_price: lead.interest_max_price ?? '',
    interest_bedrooms: lead.interest_bedrooms ?? '',
  });
  const set = (k: string, v: any) => setS((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Finalidade</Label>
          <Select value={s.interest_purpose || NONE} onValueChange={(v) => set('interest_purpose', v === NONE ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Qualquer</SelectItem>
              {PROPERTY_PURPOSE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={s.interest_property_type || NONE} onValueChange={(v) => set('interest_property_type', v === NONE ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Qualquer</SelectItem>
              {PROPERTY_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Bairro</Label>
        <Select value={s.interest_neighborhood_id || NONE} onValueChange={(v) => set('interest_neighborhood_id', v === NONE ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value={NONE}>Qualquer bairro</SelectItem>
            {neighborhoods.map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5"><Label className="text-xs">Mín R$</Label><Input type="number" min={0} value={s.interest_min_price} onChange={(e) => set('interest_min_price', e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Máx R$</Label><Input type="number" min={0} value={s.interest_max_price} onChange={(e) => set('interest_max_price', e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Quartos</Label><Input type="number" min={0} max={20} value={s.interest_bedrooms} onChange={(e) => set('interest_bedrooms', e.target.value)} /></div>
      </div>
      <Button size="sm" onClick={() => onSave({
        interest_purpose: s.interest_purpose || null,
        interest_property_type: s.interest_property_type || null,
        interest_neighborhood_id: s.interest_neighborhood_id || null,
        interest_min_price: s.interest_min_price ? Number(s.interest_min_price) : null,
        interest_max_price: s.interest_max_price ? Number(s.interest_max_price) : null,
        interest_bedrooms: s.interest_bedrooms ? Number(s.interest_bedrooms) : null,
      })}>Salvar interesse</Button>
    </div>
  );
}
