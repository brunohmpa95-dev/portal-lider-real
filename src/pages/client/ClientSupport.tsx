import { useState, useEffect, useCallback } from 'react';
import { Headphones, MessageSquare, Clock, CheckCircle, Loader2 } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'contrato', label: 'Documentação / Contrato' },
  { value: 'vistoria', label: 'Vistoria' },
  { value: 'geral', label: 'Outros' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  open: { label: 'Aberta', variant: 'default' },
  in_progress: { label: 'Em andamento', variant: 'secondary' },
  resolved: { label: 'Resolvida', variant: 'outline' },
};

const ClientSupport = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setTickets(data);
    setFetching(false);
  }, [user]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const counts = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !category || !message.trim()) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (!user) return;

    setLoading(true);
    const { error } = await supabase.from('support_requests').insert({
      user_id: user.id,
      subject: subject.trim(),
      category,
      message: message.trim(),
    });

    if (error) {
      console.error('[Support] Insert error:', error.message, error.code, error.details, error.hint);
      toast.error(`Erro ao enviar: ${error.message}`);
    } else {
      toast.success('Solicitação enviada com sucesso!');
      setSubject('');
      setCategory('');
      setMessage('');
      setOpen(false);
      fetchTickets();
    }
    setLoading(false);
  };

  return (
    <ClientLayout title="Suporte" description="Solicite suporte ou acompanhe suas solicitações.">
      <h1 className="text-xl font-sans font-bold text-foreground mb-1">Suporte</h1>
      <p className="text-muted-foreground text-sm mb-6">Abra uma solicitação ou acompanhe o andamento.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: MessageSquare, label: 'Abertas', value: counts.open, color: 'text-blue-600' },
          { icon: Clock, label: 'Em andamento', value: counts.in_progress, color: 'text-amber-600' },
          { icon: CheckCircle, label: 'Resolvidas', value: counts.resolved, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
            <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
            <p className="text-lg font-bold text-foreground">{fetching ? '—' : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      {tickets.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Suas solicitações</h2>
          {tickets.map(t => (
            <div key={t.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.category} · {format(new Date(t.created_at), 'dd/MM/yyyy')}</p>
                </div>
                <Badge variant={STATUS_MAP[t.status]?.variant || 'default'}>
                  {STATUS_MAP[t.status]?.label || t.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <Headphones className="h-10 w-10 text-primary mx-auto mb-3" />
        <p className="text-foreground font-semibold mb-1">Precisa de ajuda?</p>
        <p className="text-sm text-muted-foreground mb-4">Entre em contato com nossa equipe de atendimento.</p>
        <Button onClick={() => setOpen(true)}>Abrir solicitação</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova solicitação</DialogTitle>
            <DialogDescription>Preencha os dados abaixo para abrir uma solicitação de suporte.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título do problema</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Problema com boleto" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição detalhada</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Descreva seu problema..." rows={4} />
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
};

export default ClientSupport;
