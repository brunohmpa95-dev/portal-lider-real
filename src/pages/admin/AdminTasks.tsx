import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks, useTaskMutations, type TaskFilter, type Task } from '@/hooks/useTasks';
import TaskFormDialog from '@/components/admin/TaskFormDialog';
import { Loader2, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  async function toggleDone(t: Task) {
    try {
      await update.mutateAsync({ id: t.id, status: t.status === 'done' ? 'pending' : 'done' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta tarefa?')) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: 'Tarefa excluída' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  }

  const isOverdue = (t: Task) => t.status === 'pending' && t.due_at && new Date(t.due_at) < new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tarefas</h1>
          <p className="text-sm text-muted-foreground">Lembretes e follow-ups da equipe</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova tarefa
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as TaskFilter)}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Nenhuma tarefa nesta visão</div>
          ) : (
            <ul className="divide-y">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <Checkbox
                    checked={t.status === 'done'}
                    onCheckedChange={() => toggleDone(t)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium text-sm ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                      {isOverdue(t) && (
                        <Badge variant="destructive" className="text-[10px] h-5 gap-1">
                          <AlertCircle className="h-3 w-3" /> Atrasada
                        </Badge>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[t.priority] || ''}`}>
                        {t.priority}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                    {t.due_at && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Vencimento: {new Date(t.due_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}>
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
    </div>
  );
}
