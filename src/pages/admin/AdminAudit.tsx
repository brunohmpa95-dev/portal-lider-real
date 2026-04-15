import { useEffect, useState } from 'react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditRow {
  id: string;
  action: string;
  resource: string | null;
  target_type: string | null;
  target_id: string | null;
  result: string | null;
  user_id: string | null;
  created_at: string;
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_log')
      .select('id, action, resource, target_type, target_id, result, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) { toast.error('Erro ao carregar auditoria'); console.error(error); }
    setLogs(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <InternalPageHeader title="Auditoria" subtitle="Carregando..." />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <InternalPageHeader title="Auditoria" subtitle="Log de ações críticas e alterações no sistema" />

      {logs.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum registro de auditoria" description="Ações do sistema serão registradas aqui." />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Data/Hora</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ação</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Módulo</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Entidade</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                      {new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{log.action}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{log.resource || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{log.target_type ? `${log.target_type}${log.target_id ? ` #${log.target_id.slice(0, 8)}` : ''}` : '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${log.result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.result || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
