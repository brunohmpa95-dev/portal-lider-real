import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Building2, CalendarDays } from 'lucide-react';

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, { leads: number; visits: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPartners(); }, []);

  async function loadPartners() {
    setLoading(true);

    // Get all corretores
    const { data: corretorRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'corretor');
    const corretorIds = (corretorRoles || []).map((r: any) => r.user_id);

    if (corretorIds.length === 0) { setLoading(false); return; }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone, is_active, created_at')
      .in('user_id', corretorIds);

    // Get lead counts per partner
    const { data: leads } = await supabase.from('property_leads').select('assigned_to').in('assigned_to', corretorIds);
    const { data: visits } = await supabase.from('visits' as any).select('agent_id').in('agent_id', corretorIds);

    const statsMap: Record<string, { leads: number; visits: number }> = {};
    corretorIds.forEach((id: string) => { statsMap[id] = { leads: 0, visits: 0 }; });
    (leads || []).forEach((l: any) => { if (statsMap[l.assigned_to]) statsMap[l.assigned_to].leads++; });
    ((visits || []) as any[]).forEach((v: any) => { if (statsMap[v.agent_id]) statsMap[v.agent_id].visits++; });

    setPartners(profiles || []);
    setStats(statsMap);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Corretores Parceiros</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : partners.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Nenhum corretor parceiro encontrado</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <Card key={p.user_id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(p.full_name || 'C').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.full_name || 'Sem nome'}</p>
                    <p className="text-xs text-muted-foreground">{p.phone || '—'}</p>
                  </div>
                  <Badge variant={p.is_active ? 'default' : 'secondary'} className="ml-auto text-xs">
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-bold">{stats[p.user_id]?.leads || 0}</p>
                      <p className="text-xs text-muted-foreground">Leads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-bold">{stats[p.user_id]?.visits || 0}</p>
                      <p className="text-xs text-muted-foreground">Visitas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
