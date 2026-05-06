import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks, useTaskMutations, type TaskFilter, type Task } from '@/hooks/useTasks';
import TaskFormDialog from '@/components/admin/TaskFormDialog';
import { Loader2, Plus, Pencil, Trash2, AlertCircle, CheckCircle2, Clock, ExternalLink, ListTodo } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmptyState, ListSkeleton } from '@/components/admin/StateViews';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TABS: { value: TaskFilter; label: string }[] = [
  { value: 'mine', label: 'Minhas' },
  { value: 'team', label: 'Equipe' },
  { value: 'overdue', label: 'Atrasadas' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'done', label: 'Concluídas' },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  normal: 'bg-muted text-muted-foreground',
  low: 'bg-secondary text-muted-foreground',
};

export default function AdminTasks() {
  const [filter, setFilter] = useState<TaskFilter>('mine');
  const { data: tasks = [], isLoading } = useTasks({ filter });
  const { update, remove } = useTaskMutations();
  const [editing, setEditing] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Task | null>(null);

  // Indicadores: agregados em consultas leves separadas (independem do filtro)
  const [counts, setCounts] = useState({ overdue: 0, today: 0, doneToday: 0 });
  useEffect(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    Promise.all([
      supabase.from('tasks' as any).select('id', { count: 'exact', head: true })
        .lt('due_at', new Date().toISOString()).eq('status', 'pending'),
      supabase.from('tasks' as any).select('id', { count: 'exact', head: true })
        .gte('due_at', startToday).lt('due_at', endToday).eq('status', 'pending'),
      supabase.from('tasks' as any).select('id', { count: 'exact', head: true })
        .gte('completed_at', startToday).lt('completed_at', endToday).eq('status', 'done'),
    ]).then(([o, t, d]) => {
      setCounts({ overdue: o.count || 0, today: t.count || 0, doneToday: d.count || 0 });
    });
  }, [tasks]);

  // Lead lookup para mostrar link
  const leadIds = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.lead_id).filter(Boolean) as string[])),
    [tasks]
  );
  const [leadMap, setLeadMap] = useState<Record<string, string>>({});
  useEffect(() => {
    if (leadIds.length === 0) return;
    supabase.from('property_leads').select('id, name').in('id', leadIds)
      .then(({ data }) => {
        const m: Record<string, string> = {};
        (data || []).forEach((l: any) => { m[l.id] = l.name; });
        setLeadMap(m);
      });
  }, [leadIds.join(',')]);

  async function toggleDone(t: Task) {
    try {
      await update.mutateAsync({ id: t.id, status: t.status === 'done' ? 'pending' : 'done' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast({ title: 'Tarefa excluída' });
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  const isOverdue = (t: Task) => t.status === 'pending' && t.due_at && new Date(t.due_at) < new Date();

  const KPI_CARDS = [
    { label: 'Atrasadas', value: counts.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', filter: 'overdue' as TaskFilter },
    { label: 'Para hoje', value: counts.today, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', filter: 'today' as TaskFilter },
    { label: 'Concluídas hoje', value: counts.doneToday, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200', filter: 'done' as TaskFilter },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Tarefas & Follow-ups</h1>
          <p className="text-sm text-muted-foreground">Próximas ações e lembretes da equipe</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova tarefa
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {KPI_CARDS.map((k) => {
          const Icon = k.icon;
          const active = filter === k.filter;
          return (
            <button
              key={k.label}
              onClick={() => setFilter(k.filter)}
              className={`text-left rounded-lg border p-3 transition hover:shadow-sm ${k.bg} ${active ? 'ring-2 ring-primary/30' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${k.color}`} />
                <span className="text-[11px] sm:text-xs text-muted-foreground">{k.label}</span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </button>
          );
        })}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as TaskFilter)}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-3 sm:p-4"><ListSkeleton rows={5} /></div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<ListTodo className="h-6 w-6" />}
              title="Nenhuma tarefa nesta visão"
              description="Crie uma nova tarefa ou ajuste a aba selecionada."
              action={
                <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Nova tarefa
                </Button>
              }
            />
          ) : (
            <ul className="divide-y">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                  <Checkbox
                    checked={t.status === 'done'}
                    onCheckedChange={() => toggleDone(t)}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium text-sm break-words ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                      {isOverdue(t) && (
                        <Badge variant="destructive" className="text-[10px] h-5 gap-1">
                          <AlertCircle className="h-3 w-3" /> Atrasada
                        </Badge>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[t.priority] || ''}`}>
                        {t.priority}
                      </span>
                      {t.lead_id && leadMap[t.lead_id] && (
                        <Link
                          to={`/admin/leads/${t.lead_id}`}
                          className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5 max-w-[180px] truncate"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{leadMap[t.lead_id]}</span>
                        </Link>
                      )}
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">{t.description}</p>}
                    {t.due_at && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Vencimento: {new Date(t.due_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setDialogOpen(true); }} aria-label="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(t)} aria-label="Excluir">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TaskFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} initial={editing} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa <span className="font-medium">"{deleting?.title}"</span> será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
