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

      <div className="bg-card border border-border rounded-lg p-5 max-w-lg">
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
            <div className="flex gap-2">
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(37) 99999-0000" className="h-10" />
              <Button size="sm" onClick={handleSave} disabled={saving}>
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
