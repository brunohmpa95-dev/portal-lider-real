import InternalPageHeader from '@/components/shared/InternalPageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Download } from 'lucide-react';
import { mockClients } from '@/data/mock-internal';

export default function AdminClients() {
  return (
    <div>
      <InternalPageHeader
        title="Gestão de Clientes"
        subtitle={`${mockClients.length} clientes cadastrados`}
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" /> Novo Cliente
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF ou telefone..." className="pl-9 h-9" />
        </div>
        <Button variant="outline" size="sm" disabled>
          <Download className="h-4 w-4 mr-1" /> Exportar
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">CPF/CNPJ</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Telefone</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Cidade</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Contratos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockClients.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">{c.cpf}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.city}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.contracts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Mostrando {mockClients.length} de {mockClients.length} clientes</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
