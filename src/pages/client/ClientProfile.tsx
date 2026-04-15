import ClientLayout from '@/components/client/ClientLayout';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_LABELS } from '@/lib/auth-types';

export default function ClientProfile() {
  const { user, profile, roles } = useAuth();

  return (
    <ClientLayout title="Meu Perfil" description="Seus dados cadastrais na Líder Imóveis.">
      <InternalPageHeader title="Meu Perfil" subtitle="Dados cadastrais da sua conta" />

      <div className="bg-card border border-border rounded-lg p-5 max-w-lg">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {(profile?.full_name || 'C').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{profile?.full_name || 'Cliente'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {roles.length > 0 && (
              <p className="text-xs text-primary mt-0.5">{roles.map(r => ROLE_LABELS[r]).join(', ')}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
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
            <Input value={profile?.phone || ''} placeholder="Não informado" disabled className="h-10" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Para alterar seus dados, entre em contato com a Líder Imóveis pelo telefone ou WhatsApp.
        </p>
      </div>
    </ClientLayout>
  );
}
