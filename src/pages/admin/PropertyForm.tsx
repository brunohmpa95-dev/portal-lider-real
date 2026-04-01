import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PROPERTY_TYPE_OPTIONS, PROPERTY_PURPOSE_OPTIONS, PROPERTY_STATUS_OPTIONS } from '@/types/admin';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const defaultForm = {
  code: '', title: '', type: 'casa', purpose: 'sale', status: 'draft',
  price: '', condominium_fee: '', iptu: '', area: '',
  bedrooms: '0', suites: '0', bathrooms: '0', parking_spots: '0',
  neighborhood: '', city: 'Itaúna', state: 'MG', address: '',
  description: '', internal_notes: '', features: '',
  is_featured: false, is_super_featured: false, is_new: true,
};

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) loadProperty();
  }, [id]);

  async function loadProperty() {
    const { data } = await supabase.from('properties').select('*').eq('id', id!).single();
    if (data) {
      setForm({
        code: data.code || '',
        title: data.title || '',
        type: data.type,
        purpose: data.purpose,
        status: data.status,
        price: String(data.price || ''),
        condominium_fee: String((data as any).condominium_fee || ''),
        iptu: String((data as any).iptu || ''),
        area: String(data.area || ''),
        bedrooms: String(data.bedrooms),
        suites: String(data.suites),
        bathrooms: String(data.bathrooms),
        parking_spots: String(data.parking_spots),
        neighborhood: data.neighborhood || '',
        city: data.city,
        state: data.state,
        address: data.address || '',
        description: data.description || '',
        internal_notes: (data as any).internal_notes || '',
        features: (data.features || []).join(', '),
        is_featured: data.is_featured,
        is_super_featured: data.is_super_featured,
        is_new: data.is_new,
      });
    }
    setLoading(false);
  }

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) {
      toast({ title: 'Preencha código e título', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      type: form.type,
      purpose: form.purpose,
      status: form.status,
      price: Number(form.price) || 0,
      condominium_fee: Number(form.condominium_fee) || 0,
      iptu: Number(form.iptu) || 0,
      area: Number(form.area) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      suites: Number(form.suites) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking_spots: Number(form.parking_spots) || 0,
      neighborhood: form.neighborhood.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      address: form.address.trim() || null,
      description: form.description.trim() || null,
      internal_notes: form.internal_notes.trim() || null,
      features: form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
      is_featured: form.is_featured,
      is_super_featured: form.is_super_featured,
      is_new: form.is_new,
    } as any;

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('properties').update(payload).eq('id', id!));
    } else {
      payload.created_by = user?.id;
      ({ error } = await supabase.from('properties').insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: isEdit ? 'Imóvel atualizado' : 'Imóvel criado' });
      navigate('/admin/properties');
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/properties')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Informações Básicas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Código *</Label>
                <Input value={form.code} onChange={(e) => set('code', e.target.value)} required placeholder="Ex: LI-001" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROPERTY_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Finalidade</Label>
                <Select value={form.purpose} onValueChange={(v) => set('purpose', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROPERTY_PURPOSE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROPERTY_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Valores e Características</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>Preço (R$)</Label>
                <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Condomínio</Label>
                <Input type="number" value={form.condominium_fee} onChange={(e) => set('condominium_fee', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>IPTU</Label>
                <Input type="number" value={form.iptu} onChange={(e) => set('iptu', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Área (m²)</Label>
                <Input type="number" value={form.area} onChange={(e) => set('area', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Quartos</Label>
                <Input type="number" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Suítes</Label>
                <Input type="number" value={form.suites} onChange={(e) => set('suites', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Banheiros</Label>
                <Input type="number" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Vagas</Label>
                <Input type="number" value={form.parking_spots} onChange={(e) => set('parking_spots', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Localização</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Bairro</Label><Input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Cidade</Label><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Estado</Label><Input value={form.state} onChange={(e) => set('state', e.target.value)} maxLength={2} /></div>
              <div className="space-y-1.5 sm:col-span-3"><Label>Endereço</Label><Input value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Detalhes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} /></div>
            <div className="space-y-1.5"><Label>Características (separadas por vírgula)</Label><Input value={form.features} onChange={(e) => set('features', e.target.value)} placeholder="Piscina, Churrasqueira, Área de lazer" /></div>
            <div className="space-y-1.5"><Label>Notas Internas</Label><Textarea value={form.internal_notes} onChange={(e) => set('internal_notes', e.target.value)} rows={2} placeholder="Visível apenas para a equipe" /></div>
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => set('is_featured', v)} /><Label>Destaque</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_super_featured} onCheckedChange={(v) => set('is_super_featured', v)} /><Label>Super Destaque</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_new} onCheckedChange={(v) => set('is_new', v)} /><Label>Novo</Label></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {isEdit ? 'Salvar Alterações' : 'Criar Imóvel'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/properties')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
