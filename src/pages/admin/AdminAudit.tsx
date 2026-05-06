import { useEffect, useMemo, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { FileText, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MobileTableCard, MobileTableRow } from '@/components/admin/MobileTableCard';

interface AuditRow {
  id: string;
  action: string;
  resource: string | null;
  target_type: string | null;
  target_id: string | null;
  result: string | null;
  user_id: string | null;
  created_at: string;
  metadata?: any;
}

const PAGE_SIZE = 50;

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState('');
  const [resource, setResource] = useState<string>('all');
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('30');
  const [profileMap, setProfileMap] = useState<Map<string, string>>(new Map());

  useEffect(() => { setPage(0); loadLogs(0); /* eslint-disable-next-line */ }, [resource, period]);

  async function loadLogs(p: number) {
    setLoading(true);
    let q = supabase
      .from('audit_log')
      .select('id, action, resource, target_type, target_id, result, user_id, created_at, metadata')
      .order('created_at', { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE); // pede 1 a mais para detectar próxima página

    if (resource !== 'all') q = q.eq('resource', resource);
    if (period !== 'all') {
      const since = new Date();
      since.setDate(since.getDate() - Number(period));
      q = q.gte('created_at', since.toISOString());
    }

    const { data, error } = await q;
    if (error) {
      toast.error('Erro ao carregar auditoria');
      console.error(error);
    } else {
      const rows = (data || []) as AuditRow[];
      setHasMore(rows.length > PAGE_SIZE);
      setLogs(rows.slice(0, PAGE_SIZE));

      // resolve user names
      const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean) as string[]));
      const missing = ids.filter((id) => !profileMap.has(id));
      if (missing.length) {
        const { data: profs } = await supabase.from('profiles').select('user_id, full_name').in('user_id', missing);
        const next = new Map(profileMap);
        (profs || []).forEach((p: any) => next.set(p.user_id, p.full_name || '—'));
        setProfileMap(next);
      }
    }
    setLoading(false);
  }

  const resources = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => l.resource && set.add(l.resource));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const s = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(s) ||
        (l.resource || '').toLowerCase().includes(s) ||
        (profileMap.get(l.user_id || '') || '').toLowerCase().includes(s) ||
        (l.target_id || '').toLowerCase().includes(s),
    );
  }, [logs, search, profileMap]);

  function userName(id: string | null) {
    if (!id) return 'Sistema';
    return profileMap.get(id) || `${id.slice(0, 8)}…`;
  }

  function formatDate(s: string) {
    return new Date(s).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div>
      <InternalPageHeader title="Auditoria" subtitle="Log de ações críticas e alterações no sistema" />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar ação, usuário, ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={resource} onValueChange={setResource}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Módulo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os módulos</SelectItem>
            {resources.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7d</SelectItem>
            <SelectItem value="30">Últimos 30d</SelectItem>
            <SelectItem value="90">Últimos 90d</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum registro" description="Nenhuma ação encontrada com os filtros atuais." />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Data/Hora</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Usuário</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ação</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Módulo</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Alvo</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono whitespace-nowrap">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-3 text-sm">{userName(log.user_id)}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{log.action}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{log.resource || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                        {log.target_id ? `${log.target_type || ''} ${log.target_id.slice(0, 8)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.result === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {log.result || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-2">
            {filtered.map((log) => (
              <MobileTableCard key={log.id}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-sm break-all">{log.action}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${log.result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.result || '—'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{formatDate(log.created_at)} · {userName(log.user_id)}</p>
                {log.target_id && (
                  <MobileTableRow label="Alvo" value={`${log.target_type || ''} ${log.target_id.slice(0, 8)}`} />
                )}
              </MobileTableCard>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => { const np = page - 1; setPage(np); loadLogs(np); }}>
              ← Anterior
            </Button>
            <span className="text-xs text-muted-foreground">Página {page + 1}</span>
            <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => { const np = page + 1; setPage(np); loadLogs(np); }}>
              Próxima →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
