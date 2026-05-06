import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  LEAD_FUNNEL_STAGES, LEAD_PRIORITY_OPTIONS, LEAD_SOURCE_OPTIONS, INTERACTION_TYPE_OPTIONS,
  PROPERTY_PURPOSE_OPTIONS, PROPERTY_TYPE_OPTIONS,
} from '@/types/admin';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { useTasks, useTaskMutations } from '@/hooks/useTasks';
import LostReasonDialog from '@/components/admin/LostReasonDialog';
import TaskFormDialog from '@/components/admin/TaskFormDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Loader2, Phone, Mail, MessageSquare, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { SlaBadge } from '@/components/admin/SlaBadge';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: neighborhoods = [] } = useNeighborhoods();
  const { data: tasks = [] } = useTasks({ leadId: id });
  const { update: updateTask } = useTaskMutations();

  const [lead, setLead] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInteraction, setNewInteraction] = useState({ type: 'note', content: '' });
  const [pendingLost, setPendingLost] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editInterest, setEditInterest] = useState(false);

  useEffect(() => { if (id) loadLead(); }, [id]);

  async function loadLead() {
    setLoading(true);
    const [leadRes, intRes] = await Promise.all([
      supabase.from('property_leads').select('*').eq('id', id!).single(),
      supabase.from('lead_interactions' as any).select('*').eq('lead_id', id!).order('created_at', { ascending: false }),
    ]);
    if (leadRes.data) setLead(leadRes.data);
    setInteractions((intRes as any).data || []);
    setLoading(false);
  }

  async function updateField(field: string, value: any) {
    const { error } = await supabase.from('property_leads').update({ [field]: value } as any).eq('id', id!);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
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
      funnel_stage: 'lost',
      lost_reason_id: reasonId,
      lost_notes: notes || null,
    } as any).eq('id', id!);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Lead marcado como perdido' });
      loadLead();
    }
    setPendingLost(false);
  }

  async function addInteraction() {
    if (!newInteraction.content.trim()) return;
    const { error } = await supabase.from('lead_interactions' as any).insert({
      lead_id: id, user_id: user?.id, interaction_type: newInteraction.type, content: newInteraction.content.trim(),
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { setNewInteraction({ type: 'note', content: '' }); loadLead(); }
  }

  async function saveInterest(patch: any) {
    const { error } = await supabase.from('property_leads').update(patch as any).eq('id', id!);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { setLead((p: any) => ({ ...p, ...patch })); setEditInterest(false); toast({ title: 'Interesse atualizado' }); }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!lead) return <div className="text-center py-12 text-muted-foreground">Lead não encontrado</div>;

  const followupOverdue = lead.next_followup_at && new Date(lead.next_followup_at) < new Date();
  const interestNbName = neighborhoods.find((n) => n.id === lead.interest_neighborhood_id)?.name;

  const fmtPrice = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v) : '—';

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/leads')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{lead.name}</h1>
          <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
        </div>
        {lead.next_followup_at && (
          <Badge variant={followupOverdue ? 'destructive' : 'outline'} className="gap-1">
            <Calendar className="h-3 w-3" />
            Follow-up: {new Date(lead.next_followup_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            {followupOverdue && <AlertCircle className="h-3 w-3 ml-1" />}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Dados */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Dados do Lead</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  <p className="text-sm font-medium">{lead.phone || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Origem</Label>
                  <p className="text-sm font-medium">{LEAD_SOURCE_OPTIONS.find((s) => s.value === lead.source)?.label || lead.source}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cadastrado em</Label>
                  <p className="text-sm font-medium">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Atualizado em</Label>
                  <p className="text-sm font-medium">{new Date(lead.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              {lead.message && (
                <div>
                  <Label className="text-xs text-muted-foreground">Mensagem</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{lead.message}</p>
                </div>
              )}
              {lead.internal_notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notas Internas</Label>
                  <p className="text-sm mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">{lead.internal_notes}</p>
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

          {/* Interações */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Histórico de Interações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={newInteraction.type} onValueChange={(v) => setNewInteraction((p) => ({ ...p, type: v }))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERACTION_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Descreva a interação..."
                  className="flex-1"
                  value={newInteraction.content}
                  onChange={(e) => setNewInteraction((p) => ({ ...p, content: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addInteraction()}
                />
                <Button size="sm" onClick={addInteraction}><Plus className="h-4 w-4" /></Button>
              </div>
              <Separator />
              {interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma interação registrada</p>
              ) : (
                <div className="space-y-3">
                  {interactions.map((int: any) => (
                    <div key={int.id} className="flex gap-3 p-3 rounded-lg border border-border">
                      <div className="p-1.5 rounded bg-muted">
                        {int.interaction_type === 'call' ? <Phone className="h-3.5 w-3.5" /> :
                         int.interaction_type === 'email' ? <Mail className="h-3.5 w-3.5" /> :
                         <MessageSquare className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {INTERACTION_TYPE_OPTIONS.find((o) => o.value === int.interaction_type)?.label || int.interaction_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{new Date(int.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm mt-1">{int.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Etapa do Funil</Label>
                <Select value={lead.funnel_stage} onValueChange={handleStageChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_FUNNEL_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
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

          <SlaTimelineCard leadId={lead.id} lead={lead} />

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Ações Rápidas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {lead.phone && (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="h-4 w-4 mr-2" /> Enviar e-mail
                </a>
              </Button>
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
    </div>
  );
}

const NONE = '__none__';

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
