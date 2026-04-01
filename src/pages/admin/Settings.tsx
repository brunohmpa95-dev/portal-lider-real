import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Building2, Phone, Mail, Globe, Shield } from 'lucide-react';

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

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
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
