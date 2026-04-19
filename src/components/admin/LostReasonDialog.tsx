import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLostReasons } from '@/hooks/useLostReasons';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  leadName?: string;
  onCancel: () => void;
  onConfirm: (reasonId: string, notes: string) => Promise<void> | void;
}

export default function LostReasonDialog({ open, leadName, onCancel, onConfirm }: Props) {
  const { data: reasons = [], isLoading } = useLostReasons();
  const [reasonId, setReasonId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!reasonId) return;
    setSaving(true);
    try {
      await onConfirm(reasonId, notes);
      setReasonId('');
      setNotes('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar lead como perdido</DialogTitle>
          <DialogDescription>
            {leadName ? `Selecione o motivo da perda para ${leadName}.` : 'Selecione o motivo da perda.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Motivo da perda *</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando…</div>
            ) : (
              <Select value={reasonId} onValueChange={setReasonId}>
                <SelectTrigger><SelectValue placeholder="Selecione um motivo" /></SelectTrigger>
                <SelectContent>
                  {reasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Observações (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Detalhes adicionais sobre a perda..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!reasonId || saving} variant="destructive">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Confirmar perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
