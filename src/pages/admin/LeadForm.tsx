import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LEAD_SOURCE_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_FUNNEL_STAGES,
  LEAD_TEMPERATURE_OPTIONS,
  LEAD_CHANNEL_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PROPERTY_PURPOSE_OPTIONS,
} from '@/types/admin';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const NONE = '__none__';

export default function LeadForm() {
  const navigate = useNavigate();
  const { data: neighborhoods = [] } = useNeighborhoods();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    message: '',
    source: 'website',
    channel: 'form_site',
    priority: 'normal',
    temperature: 'cold',
    funnel_stage: 'new',
    internal_notes: '',
    interest_purpose: '',
    interest_property_type: '',
    interest_neighborhood_id: '',
    interest_min_price: '',
    interest_max_price: '',
    interest_bedrooms: '',
    next_followup_at: '',
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Preencha nome e e-mail', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload: any = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      message: form.message.trim() || null,
      source: form.source,
      channel: form.channel,
      priority: form.priority,
      temperature: form.temperature,
      funnel_stage: form.funnel_stage,
      internal_notes: form.internal_notes.trim() || null,
      interest_purpose: form.interest_purpose || null,
      interest_property_type: form.interest_property_type || null,
      interest_neighborhood_id: form.interest_neighborhood_id || null,
      interest_min_price: form.interest_min_price ? Number(form.interest_min_price) : null,
      interest_max_price: form.interest_max_price ? Number(form.interest_max_price) : null,
      interest_bedrooms: form.interest_bedrooms ? Number(form.interest_bedrooms) : null,
      next_followup_at: form.next_followup_at ? new Date(form.next_followup_at).toISOString() : null,
    };
    const { data: inserted, error } = await supabase
      .from('property_leads')
      .insert(payload)
      .select('id')
      .single();
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Lead criado com sucesso' });
      // Dispara distribuição automática (não bloqueia navegação)
      if (inserted?.id) {
        supabase.functions.invoke('lead-distributor', {
          body: { action: 'distribute', lead_id: inserted.id },
        }).catch(() => {});
      }
      navigate('/admin/leads');
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Novo Lead</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold mb-3">Dados do contato</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail *</Label>
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Origem</Label>
                  <Select value={form.source} onValueChange={(v) => set('source', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Etapa do Funil</Label>
                  <Select value={form.funnel_stage} onValueChange={(v) => set('funnel_stage', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_FUNNEL_STAGES.filter((s) => s.value !== 'lost').map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-3">Interesse do cliente</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Finalidade</Label>
                  <Select value={form.interest_purpose || NONE} onValueChange={(v) => set('interest_purpose', v === NONE ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Qualquer</SelectItem>
                      {PROPERTY_PURPOSE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de imóvel</Label>
                  <Select value={form.interest_property_type || NONE} onValueChange={(v) => set('interest_property_type', v === NONE ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Qualquer</SelectItem>
                      {PROPERTY_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Bairro de interesse</Label>
                  <Select value={form.interest_neighborhood_id || NONE} onValueChange={(v) => set('interest_neighborhood_id', v === NONE ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Qualquer bairro" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value={NONE}>Qualquer bairro</SelectItem>
                      {neighborhoods.map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Faixa mín (R$)</Label>
                  <Input type="number" min={0} value={form.interest_min_price} onChange={(e) => set('interest_min_price', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Faixa máx (R$)</Label>
                  <Input type="number" min={0} value={form.interest_max_price} onChange={(e) => set('interest_max_price', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Quartos mín</Label>
                  <Input type="number" min={0} max={20} value={form.interest_bedrooms} onChange={(e) => set('interest_bedrooms', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Próximo follow-up</Label>
                  <Input type="datetime-local" value={form.next_followup_at} onChange={(e) => set('next_followup_at', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Mensagem / Interesse</Label>
              <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Notas Internas</Label>
              <Textarea value={form.internal_notes} onChange={(e) => set('internal_notes', e.target.value)} rows={2} placeholder="Visível apenas para a equipe" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Salvar Lead
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/leads')}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
