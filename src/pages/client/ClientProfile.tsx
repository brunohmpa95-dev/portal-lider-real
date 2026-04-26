import { useState } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_LABELS } from '@/lib/auth-types';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ClientProfile() {
  const { user, profile, roles } = useAuth();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ phone }).eq('user_id', user.id);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Dados atualizados');
    setSaving(false);
  }

  return (
    <ClientLayout title="Meu Perfil" description="Seus dados cadastrais na Líder Imóveis.">
      <InternalPageHeader title="Meu Perfil" subtitle="Dados cadastrais da sua conta" />

      <div className="bg-card border border-border rounded-lg p-4 sm:p-5 max-w-lg">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {(profile?.full_name || 'C').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{profile?.full_name || 'Cliente'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            {roles.length > 0 && (
              <p className="text-xs text-primary mt-0.5 truncate">{roles.map(r => ROLE_LABELS[r]).join(', ')}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Nome completo</label>
            <Input value={profile?.full_name || ''} disabled className="h-11 text-base sm:text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">E-mail</label>
            <Input value={user?.email || ''} disabled className="h-11 text-base sm:text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Telefone</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(37) 99999-0000" className="h-11 text-base sm:text-sm" />
              <Button onClick={handleSave} disabled={saving} className="h-11 sm:h-10 w-full sm:w-auto">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Para alterar nome ou e-mail, entre em contato com a Líder Imóveis.
        </p>
      </div>
    </ClientLayout>
  );
}
