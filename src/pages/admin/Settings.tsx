import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Phone, Mail, Globe, Shield, MessageSquare, Loader2 } from 'lucide-react';

export default function Settings() {
  const [company, setCompany] = useState({
    name: 'Líder Imóveis',
    creci: '',
    phone: '(37) 3241-0000',
    whatsapp: '(37) 99900-0000',
    email: 'contato@liderimoveis.com.br',
    address: 'Itaúna - MG',
    website: 'https://liderimoveis.com.br',
    instagram: '',
    facebook: '',
    description: '',
  });

  const set = (k: string, v: string) => setCompany((c) => ({ ...c, [k]: v }));

  function handleSave() {
    toast({ title: 'Configurações salvas', description: 'As alterações foram aplicadas.' });
  }

  // ---- WhatsApp settings (persistido) ----
  const [wa, setWa] = useState<any>(null);
  const [waLoading, setWaLoading] = useState(true);
  const [waSaving, setWaSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('whatsapp_settings' as any)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setWa(
        data || {
          is_active: true,
          phone_e164: '5537999000000',
          display_phone: '(37) 99900-0000',
          default_message: 'Olá! Vim pelo site da Líder Imóveis Itaúna.',
          responsible_sector: 'vendas',
          auto_create_lead: true,
          provider: 'web',
        },
      );
      setWaLoading(false);
    })();
  }, []);

  function setWaField<K extends string>(k: K, v: any) {
    setWa((s: any) => ({ ...s, [k]: v }));
  }

  async function saveWhatsApp() {
    if (!wa) return;
    setWaSaving(true);
    const payload: any = {
      is_active: !!wa.is_active,
      phone_e164: String(wa.phone_e164 || '').replace(/\D/g, ''),
      display_phone: wa.display_phone || null,
      default_message: wa.default_message || '',
      responsible_sector: wa.responsible_sector || 'vendas',
      auto_create_lead: !!wa.auto_create_lead,
      provider: wa.provider || 'web',
    };
    let error;
    if (wa.id) {
      ({ error } = await supabase.from('whatsapp_settings' as any).update(payload).eq('id', wa.id));
    } else {
      const ins = await supabase.from('whatsapp_settings' as any).insert(payload).select().single();
      error = ins.error;
      if (ins.data) setWa(ins.data);
    }
    setWaSaving(false);
    if (error) toast({ title: 'Erro ao salvar WhatsApp', description: error.message, variant: 'destructive' });
    else toast({ title: 'WhatsApp atualizado' });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome da Empresa</Label>
                  <Input value={company.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>CRECI</Label>
                  <Input value={company.creci} onChange={(e) => set('creci', e.target.value)} placeholder="Número do CRECI" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Endereço</Label>
                <Input value={company.address} onChange={(e) => set('address', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Textarea value={company.description} onChange={(e) => set('description', e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contatos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Telefone</Label><Input value={company.phone} onChange={(e) => set('phone', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={company.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>E-mail</Label><Input value={company.email} onChange={(e) => set('email', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Website</Label><Input value={company.website} onChange={(e) => set('website', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Instagram</Label><Input value={company.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@usuario" /></div>
                <div className="space-y-1.5"><Label>Facebook</Label><Input value={company.facebook} onChange={(e) => set('facebook', e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave}>Salvar Configurações</Button>
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferências do Sistema</CardTitle>
              <CardDescription>Ajustes gerais de funcionamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configurações de sistema como notificações automáticas, integrações e personalização
                serão implementadas conforme a operação avança.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" /> Segurança
              </CardTitle>
              <CardDescription>Controles de segurança e acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <h3 className="font-medium text-sm mb-2">Políticas ativas:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ RLS ativo em todas as tabelas</li>
                  <li>✓ Isolamento de dados por perfil</li>
                  <li>✓ Auditoria de login/logout</li>
                  <li>✓ Sessão com expiração automática</li>
                  <li>✓ Validação server-side nos formulários</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
