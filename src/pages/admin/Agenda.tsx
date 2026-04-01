import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VISIT_STATUS_OPTIONS } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2, CalendarDays, Clock, MapPin, User } from 'lucide-react';

export default function Agenda() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    scheduled_at: '',
    duration_minutes: '30',
    notes: '',
    status: 'scheduled',
  });

  useEffect(() => { loadVisits(); }, []);

  async function loadVisits() {
    setLoading(true);
    const { data } = await supabase
      .from('visits' as any)
      .select('*')
      .order('scheduled_at', { ascending: true });
    setVisits((data as any[]) || []);
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
      loadVisits();
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('visits' as any).update({ status }).eq('id', id);
    if (!error) setVisits((v) => v.map((x) => x.id === id ? { ...x, status } : x));
  }

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      rescheduled: 'bg-amber-100 text-amber-700',
    };
    return map[s] || 'bg-muted text-muted-foreground';
  };

  const upcoming = visits.filter((v) => v.status === 'scheduled' && new Date(v.scheduled_at) >= new Date());
  const past = visits.filter((v) => v.status !== 'scheduled' || new Date(v.scheduled_at) < new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
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

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">Próximas Visitas ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhuma visita agendada</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {new Date(v.scheduled_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(v.status)}`}>
                          {VISIT_STATUS_OPTIONS.find((o) => o.value === v.status)?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(v.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        <span>• {v.duration_minutes} min</span>
                      </div>
                      {v.notes && <p className="text-sm text-muted-foreground">{v.notes}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => updateStatus(v.id, 'completed')}>
                          Realizada
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs flex-1 text-destructive" onClick={() => updateStatus(v.id, 'cancelled')}>
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Histórico ({past.length})</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {past.slice(0, 20).map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{new Date(v.scheduled_at).toLocaleDateString('pt-BR')}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(v.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(v.status)}`}>
                          {VISIT_STATUS_OPTIONS.find((o) => o.value === v.status)?.label}
                        </span>
                      </div>
                    ))}
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
