import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { INTERACTION_TYPE_OPTIONS } from '@/types/admin';

interface Props {
  leadId: string | null;
  leadName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'note' | 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting';
  onDone?: () => void;
}

export default function QuickInteractionDialog({ leadId, leadName, open, onOpenChange, defaultType = 'note', onDone }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<string>(defaultType);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!leadId || !content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('lead_interactions' as any).insert({
      lead_id: leadId,
      user_id: user?.id,
      interaction_type: type,
      content: content.trim(),
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Interação registrada' });
    setContent('');
    setType(defaultType);
    onOpenChange(false);
    onDone?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar interação{leadName ? ` — ${leadName}` : ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Detalhe a interação realizada..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={save} disabled={saving || !content.trim()}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
