import ClientLayout from '@/components/client/ClientLayout';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

export default function ClientProfile() {
  const { user, profile } = useAuth();

  return (
    <ClientLayout title="Meu Perfil" description="Seus dados cadastrais na Líder Imóveis.">
      <InternalPageHeader title="Meu Perfil" subtitle="Dados cadastrais da sua conta" />

      <div className="bg-card border border-border rounded-lg p-5 max-w-lg space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Nome completo</label>
          <Input value={profile?.full_name || ''} disabled className="h-10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">E-mail</label>
          <Input value={user?.email || ''} disabled className="h-10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Telefone</label>
          <Input value={profile?.phone || ''} disabled className="h-10" />
        </div>
        <p className="text-xs text-muted-foreground">Para alterar seus dados, entre em contato com a Líder Imóveis pelo telefone ou WhatsApp.</p>
      </div>
    </ClientLayout>
  );
}
