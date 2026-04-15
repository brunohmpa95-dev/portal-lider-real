import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BrokerProfile() {
  const { user, profile } = useAuth();

  return (
    <div>
      <InternalPageHeader title="Meu Perfil" subtitle="Seus dados profissionais" />

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
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">CRECI</label>
          <Input placeholder="Ex: CRECI-MG 12345" disabled className="h-10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Região de atuação</label>
          <Input placeholder="Ex: Centro, São Geraldo" disabled className="h-10" />
        </div>
        <p className="text-xs text-muted-foreground">Para alterar seus dados, entre em contato com a administração da Líder Imóveis.</p>
      </div>
    </div>
  );
}
