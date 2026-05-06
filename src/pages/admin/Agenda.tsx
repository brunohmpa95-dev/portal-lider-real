import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VISIT_STATUS_OPTIONS } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { APPOINTMENT_TYPE_LABEL } from '@/hooks/useTasks';
import { Plus, Loader2, CalendarDays, Clock, ExternalLink, Phone, MessageSquare, Users, RefreshCw, Calendar as CalIcon } from 'lucide-react';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/admin/StateViews';

type AgendaItem = {
  id: string;
  source: 'visit' | 'task';
  type: string; // visit|meeting|call|whatsapp|followup
  scheduled_at: string;
  duration_minutes?: number | null;
  title: string;
  notes?: string | null;
  status: string;
  lead_id: string | null;
  property_id?: string | null;
  agent_id?: string | null;
};

const TYPE_ICON: Record<string, any> = {
  visit: CalIcon,
  meeting: Users,
  call: Phone,
  whatsapp: MessageSquare,
  followup: RefreshCw,
};

const TYPE_COLOR: Record<string, string> = {
  visit: 'bg-blue-100 text-blue-700',
  meeting: 'bg-purple-100 text-purple-700',
  call: 'bg-emerald-100 text-emerald-700',
  whatsapp: 'bg-green-100 text-green-700',
  followup: 'bg-amber-100 text-amber-700',
};

export default function Agenda() {
  const { user } = useAuth();
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [form, setForm] = useState({
    scheduled_at: '',
    duration_minutes: '30',
    notes: '',
    status: 'scheduled',
  });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ data: visits, error: vErr }, { data: tasks, error: tErr }] = await Promise.all([
        supabase.from('visits' as any).select('id, scheduled_at, duration_minutes, status, notes, lead_id, property_id, agent_id').order('scheduled_at', { ascending: true }),
        supabase
          .from('tasks' as any)
          .select('id, title, due_at, status, description, lead_id, property_id, assigned_to, appointment_type')
          .not('appointment_type', 'is', null)
          .not('due_at', 'is', null)
          .order('due_at', { ascending: true }),
      ]);
      if (vErr || tErr) throw new Error(vErr?.message || tErr?.message);

    const visitItems: AgendaItem[] = ((visits as any[]) || []).map((v) => ({
      id: v.id,
      source: 'visit',
      type: 'visit',
      scheduled_at: v.scheduled_at,
      duration_minutes: v.duration_minutes,
      title: 'Visita ao imóvel',
      notes: v.notes,
      status: v.status,
      lead_id: v.lead_id,
      property_id: v.property_id,
      agent_id: v.agent_id,
    }));

    const taskItems: AgendaItem[] = ((tasks as any[]) || []).map((t) => ({
      id: t.id,
      source: 'task',
      type: t.appointment_type,
      scheduled_at: t.due_at,
      duration_minutes: null,
      title: t.title,
      notes: t.description,
      status: t.status === 'done' ? 'completed' : t.status === 'cancelled' ? 'cancelled' : 'scheduled',
      lead_id: t.lead_id,
      property_id: t.property_id,
      agent_id: t.assigned_to,
    }));

    setItems([...visitItems, ...taskItems].sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at)));
    setLoading(false);
  }

  async function createVisit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.scheduled_at) { toast({ title: 'Selecione data e hora', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await supabase.from('visits' as any).insert({
      agent_id: user?.id,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      duration_minutes: Number(form.duration_minutes) || 30,
      notes: form.notes.trim() || null,
      status: form.status,
      created_by: user?.id,
    });
    setSaving(false);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Visita agendada' });
      setDialogOpen(false);
      setForm({ scheduled_at: '', duration_minutes: '30', notes: '', status: 'scheduled' });
      loadAll();
    }
  }

  async function updateStatus(item: AgendaItem, status: string) {
    if (item.source === 'visit') {
      const { error } = await supabase.from('visits' as any).update({ status }).eq('id', item.id);
      if (!error) setItems((arr) => arr.map((x) => x.id === item.id && x.source === 'visit' ? { ...x, status } : x));
    } else {
      const taskStatus = status === 'completed' ? 'done' : status === 'cancelled' ? 'cancelled' : 'pending';
      const { error } = await supabase.from('tasks' as any).update({ status: taskStatus }).eq('id', item.id);
      if (!error) setItems((arr) => arr.map((x) => x.id === item.id && x.source === 'task' ? { ...x, status } : x));
    }
  }

  const filtered = useMemo(
    () => typeFilter === 'all' ? items : items.filter((i) => i.type === typeFilter),
    [items, typeFilter],
  );

  const upcoming = filtered.filter((v) => v.status === 'scheduled' && new Date(v.scheduled_at) >= new Date());
  const past = filtered.filter((v) => v.status !== 'scheduled' || new Date(v.scheduled_at) < new Date());

  function typeLabel(t: string) {
    return APPOINTMENT_TYPE_LABEL[t] || 'Visita';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="visit">Visitas</SelectItem>
              <SelectItem value="meeting">Reuniões</SelectItem>
              <SelectItem value="call">Ligações</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="followup">Retornos</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Visita</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Agendar Visita</DialogTitle></DialogHeader>
              <form onSubmit={createVisit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Data e Hora *</Label>
                  <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Duração (min)</Label>
                  <Input type="number" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Observações</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Agendar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        A agenda mostra visitas e tarefas com tipo de compromisso (criadas no detalhe do lead ou em Tarefas).
      </p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">Próximos compromissos ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhum compromisso agendado</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((v) => {
                  const Icon = TYPE_ICON[v.type] || CalIcon;
                  return (
                    <Card key={`${v.source}-${v.id}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {new Date(v.scheduled_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${TYPE_COLOR[v.type] || 'bg-muted text-muted-foreground'}`}>
                            <Icon className="h-3 w-3" />
                            {typeLabel(v.type)}
                          </span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{v.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(v.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          {v.duration_minutes ? <span>• {v.duration_minutes} min</span> : null}
                        </div>
                        {v.notes && <p className="text-sm text-muted-foreground line-clamp-2">{v.notes}</p>}
                        <div className="flex gap-2 flex-wrap">
                          {v.lead_id && (
                            <Button asChild size="sm" variant="outline" className="text-xs">
                              <Link to={`/admin/leads/${v.lead_id}`}>
                                <ExternalLink className="h-3 w-3 mr-1" /> Lead
                              </Link>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => updateStatus(v, 'completed')}>
                            Concluir
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs text-destructive" onClick={() => updateStatus(v, 'cancelled')}>
                            Cancelar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Histórico ({past.length})</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {past.slice(0, 30).map((v) => {
                      const Icon = TYPE_ICON[v.type] || CalIcon;
                      return (
                        <div key={`${v.source}-${v.id}`} className="flex items-center justify-between p-3 gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm shrink-0">{new Date(v.scheduled_at).toLocaleDateString('pt-BR')}</span>
                            <span className="text-sm text-muted-foreground shrink-0">
                              {new Date(v.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-sm truncate">{v.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {v.lead_id && (
                              <Button asChild size="sm" variant="ghost" className="h-7 px-2">
                                <Link to={`/admin/leads/${v.lead_id}`}><ExternalLink className="h-3 w-3" /></Link>
                              </Button>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_COLOR[v.type] || 'bg-muted text-muted-foreground'}`}>
                              {typeLabel(v.type)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
