import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientRow {
  id: string;
  cpf_cnpj: string | null;
  city: string | null;
  profile_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  profiles?: { full_name: string | null; phone: string | null; is_active: boolean } | null;
  leads_count?: number;
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('id, cpf_cnpj, city, profile_id, full_name, email, phone, created_at, profiles(full_name, phone, is_active)' as any)
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar clientes'); console.error(error); }
    const rows = (data as any[]) || [];
    // Contar leads por cliente
    if (rows.length) {
      const ids = rows.map((c) => c.id);
      const { data: leads } = await supabase.from('property_leads')
        .select('client_id').in('client_id', ids);
      const counts: Record<string, number> = {};
      (leads || []).forEach((l: any) => { counts[l.client_id] = (counts[l.client_id] || 0) + 1; });
      rows.forEach((c) => { c.leads_count = counts[c.id] || 0; });
    }
    setClients(rows);
    setLoading(false);
  }

  const filtered = clients.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = c.full_name || c.profiles?.full_name || '';
    const phone = c.phone || c.profiles?.phone || '';
    return (
      name.toLowerCase().includes(q) ||
      c.cpf_cnpj?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const active = filtered.filter(c => c.profiles?.is_active !== false);

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Gestão de Clientes" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader
        title="Gestão de Clientes"
        subtitle={`${clients.length} clientes cadastrados`}
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <KPICard title="Total" value={clients.length} icon={Users} />
        <KPICard title="Ativos" value={active.length} icon={Users} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, e-mail, telefone, CPF ou cidade..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente encontrado" description="Cadastre clientes para vê-los aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Contato</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">CPF/CNPJ</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Cidade</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Leads</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {c.full_name || c.profiles?.full_name || '—'}
                      {!c.profile_id && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground border rounded px-1 py-0.5">sem login</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">
                      <div>{c.email || '—'}</div>
                      <div>{c.phone || c.profiles?.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{c.cpf_cnpj || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.city || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{c.leads_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.profiles?.is_active !== false ? 'active' : 'inactive'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Mostrando {filtered.length} de {clients.length} clientes
          </div>
        </div>
      )}
    </div>
  );
}
