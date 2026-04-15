import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function BrokerProfile() {
  const { user, profile } = useAuth();
  const [broker, setBroker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');

  useEffect(() => { loadBroker(); }, []);

  async function loadBroker() {
    setLoading(true);
    if (profile) {
      const { data } = await supabase
        .from('brokers')
        .select('id, creci, region, commission_pct, status, bank_info')
        .eq('profile_id', profile.id)
        .maybeSingle();
      setBroker(data);
    }
    setLoading(false);
  }

  async function handleSavePhone() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ phone }).eq('user_id', user.id);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Telefone atualizado');
    setSaving(false);
  }

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Meu Perfil" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

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
          <div className="flex gap-2">
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(37) 99999-0000" className="h-10" />
            <Button size="sm" onClick={handleSavePhone} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">CRECI</label>
          <Input value={broker?.creci || ''} disabled className="h-10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Região de atuação</label>
          <Input value={broker?.region || ''} disabled className="h-10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Comissão (%)</label>
          <Input value={broker?.commission_pct != null ? `${broker.commission_pct}%` : '—'} disabled className="h-10" />
        </div>
        <p className="text-xs text-muted-foreground">Para alterar CRECI ou região, entre em contato com a administração da Líder Imóveis.</p>
      </div>
    </div>
  );
}
