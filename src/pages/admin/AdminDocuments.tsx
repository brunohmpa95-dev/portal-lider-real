import InternalPageHeader from '@/components/shared/InternalPageHeader';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, FolderOpen } from 'lucide-react';

const mockDocuments = [
  { id: '1', title: 'Contrato Locação - Carlos Eduardo', type: 'Contrato', property: 'Casa 3Q Centro', visibility: 'private', status: 'active', date: '2026-01-15' },
  { id: '2', title: 'Laudo Vistoria Entrada', type: 'Vistoria', property: 'Apto 2Q São Geraldo', visibility: 'client', status: 'active', date: '2026-04-05' },
  { id: '3', title: 'Declaração Quitação 2025', type: 'Financeiro', property: null, visibility: 'client', status: 'active', date: '2026-03-20' },
  { id: '4', title: 'Escritura Imóvel LDR-0078', type: 'Escritura', property: 'Apto 2Q São Geraldo', visibility: 'private', status: 'pending', date: '2026-04-10' },
];

const VISIBILITY_LABELS: Record<string, string> = { private: 'Interno', client: 'Cliente', public: 'Público' };

export default function AdminDocuments() {
  return (
    <div>
      <InternalPageHeader
        title="Documentos"
        subtitle="Upload, categorização e visibilidade de documentos"
        actions={
          <Button size="sm" disabled>
            <Upload className="h-4 w-4 mr-1" /> Upload
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Título</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Imóvel</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Visibilidade</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockDocuments.map(d => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">{d.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{d.type}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{d.property || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.visibility === 'client' ? 'new' : d.visibility === 'public' ? 'active' : 'inactive'} label={VISIBILITY_LABELS[d.visibility]} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(d.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
