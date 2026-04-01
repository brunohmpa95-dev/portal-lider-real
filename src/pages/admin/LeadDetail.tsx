import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { LEAD_FUNNEL_STAGES, LEAD_PRIORITY_OPTIONS, LEAD_SOURCE_OPTIONS, INTERACTION_TYPE_OPTIONS } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Loader2, Phone, Mail, MessageSquare } from 'lucide-react';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newInteraction, setNewInteraction] = useState({ type: 'note', content: '' });

  useEffect(() => {
    if (id) loadLead();
  }, [id]);

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
    setSaving(true);
    const { error } = await supabase.from('property_leads').update({ [field]: value } as any).eq('id', id!);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      setLead((prev: any) => ({ ...prev, [field]: value }));
      toast({ title: 'Atualizado' });
    }
  }

  async function addInteraction() {
    if (!newInteraction.content.trim()) return;
    const { error } = await supabase.from('lead_interactions' as any).insert({
      lead_id: id,
      user_id: user?.id,
      interaction_type: newInteraction.type,
      content: newInteraction.content.trim(),
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      setNewInteraction({ type: 'note', content: '' });
      loadLead();
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!lead) return <div className="text-center py-12 text-muted-foreground">Lead não encontrado</div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/leads')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-sm text-muted-foreground">{lead.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
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
            </CardContent>
          </Card>

          {/* Interactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Histórico de Interações</CardTitle>
            </CardHeader>
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
                          <span className="text-xs text-muted-foreground">
                            {new Date(int.created_at).toLocaleString('pt-BR')}
                          </span>
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

        {/* Sidebar controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Etapa do Funil</Label>
                <Select value={lead.funnel_stage} onValueChange={(v) => updateField('funnel_stage', v)}>
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
                <Label className="text-xs">Status</Label>
                <Select value={lead.status} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="lost">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
}
