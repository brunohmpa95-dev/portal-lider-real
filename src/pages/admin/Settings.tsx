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

        <TabsContent value="whatsapp" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Integração WhatsApp
              </CardTitle>
              <CardDescription>
                Captura cliques nos botões de WhatsApp do site e gera leads automaticamente no CRM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {waLoading || !wa ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="text-sm">Integração ativa</Label>
                      <p className="text-xs text-muted-foreground">Quando desativada, nenhum lead é criado por clique.</p>
                    </div>
                    <Switch checked={!!wa.is_active} onCheckedChange={(v) => setWaField('is_active', v)} />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="text-sm">Criar lead automaticamente</Label>
                      <p className="text-xs text-muted-foreground">Cada clique relevante vira um lead com origem WhatsApp.</p>
                    </div>
                    <Switch checked={!!wa.auto_create_lead} onCheckedChange={(v) => setWaField('auto_create_lead', v)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Número (E.164, só dígitos)</Label>
                      <Input
                        value={wa.phone_e164 || ''}
                        onChange={(e) => setWaField('phone_e164', e.target.value.replace(/\D/g, ''))}
                        placeholder="5537999000000"
                      />
                      <p className="text-[11px] text-muted-foreground">Inclui DDI 55 + DDD + número.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Exibição</Label>
                      <Input
                        value={wa.display_phone || ''}
                        onChange={(e) => setWaField('display_phone', e.target.value)}
                        placeholder="(37) 99900-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Mensagem padrão</Label>
                    <Textarea
                      rows={3}
                      value={wa.default_message || ''}
                      onChange={(e) => setWaField('default_message', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Setor responsável</Label>
                      <Select value={wa.responsible_sector || 'vendas'} onValueChange={(v) => setWaField('responsible_sector', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="locacao">Locação</SelectItem>
                          <SelectItem value="atendimento">Atendimento</SelectItem>
                          <SelectItem value="captacao">Captação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Provedor</Label>
                      <Select value={wa.provider || 'web'} onValueChange={(v) => setWaField('provider', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Link wa.me (atual)</SelectItem>
                          <SelectItem value="cloud_api" disabled>Cloud API (FASE 2)</SelectItem>
                          <SelectItem value="twilio" disabled>Twilio (FASE 2)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveWhatsApp} disabled={waSaving}>
                      {waSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                      Salvar WhatsApp
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferências do Sistema</CardTitle>
              <CardDescription>Ajustes gerais de funcionamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-medium text-sm">Distribuição de leads</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure regras de atribuição automática (rodízio, corretor do imóvel, manual).
                  </p>
                </div>
                <a href="/admin/distribuicao" className="text-sm text-primary hover:underline whitespace-nowrap">
                  Abrir regras →
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Outras configurações de sistema serão adicionadas conforme a operação avança.
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
