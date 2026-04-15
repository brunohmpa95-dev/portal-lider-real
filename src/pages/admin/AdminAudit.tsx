import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { mockAuditLogs } from '@/data/mock-internal';

export default function AdminAudit() {
  return (
    <div>
      <InternalPageHeader title="Auditoria" subtitle="Log de ações críticas e alterações no sistema" />

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Data/Hora</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Usuário</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ação</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Módulo</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Entidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                    {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{log.actor}</td>
                  <td className="px-4 py-3 text-foreground">{log.action}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{log.module}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
