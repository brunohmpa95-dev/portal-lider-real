import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskMutations, type Task } from '@/hooks/useTasks';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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

export default function TaskFormDialog({ open, onClose, initial, defaultLeadId }: Props) {
  const { create, update } = useTaskMutations();
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_at: '',
    priority: 'normal' as Task['priority'],
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: initial?.title || '',
        description: initial?.description || '',
        due_at: initial?.due_at ? initial.due_at.slice(0, 16) : '',
        priority: (initial?.priority as Task['priority']) || 'normal',
      });
    }
  }, [open, initial]);

  const isEdit = !!initial?.id;

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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Vencimento</Label>
              <Input type="datetime-local" value={form.due_at} onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))} />
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
        </div>
        <DialogFooter>
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
