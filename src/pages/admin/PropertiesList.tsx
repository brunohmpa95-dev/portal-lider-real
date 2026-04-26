import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Eye, Edit, Trash2, Loader2, Star, X } from 'lucide-react';
import { PROPERTY_STATUS_OPTIONS, PROPERTY_TYPE_OPTIONS, PROPERTY_PURPOSE_OPTIONS } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function PropertiesList() {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPurpose, setFilterPurpose] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; bulk: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = roles.some((r) => ['administrativo', 'superadmin'].includes(r));
  const canEdit = roles.some((r) => ['corretor', 'vendas', 'administrativo', 'superadmin'].includes(r));

  useEffect(() => { loadProperties(); }, []);

  // Clear selection when filters change to avoid acting on hidden rows
  useEffect(() => {
    setSelectedIds(new Set());
  }, [search, filterStatus, filterType, filterPurpose]);

  async function loadProperties() {
    setLoading(true);
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }

  async function performDelete(ids: string[]) {
    setDeleting(true);
    const { error } = await supabase.from('properties').delete().in('id', ids);
    setDeleting(false);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: ids.length > 1 ? `${ids.length} imóveis excluídos` : 'Imóvel excluído' });
    setProperties((p) => p.filter((x) => !ids.includes(x.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setConfirmDelete(null);
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === 'published' ? 'paused' : 'published';
    const { error } = await supabase.from('properties').update({ status: next }).eq('id', id);
    if (!error) setProperties((p) => p.map((x) => x.id === id ? { ...x, status: next } : x));
  }

  const filtered = useMemo(() => properties.filter((p) => {
    if (search) {
      const s = search.toLowerCase();
      if (!p.title?.toLowerCase().includes(s) && !p.code?.toLowerCase().includes(s) && !p.neighborhood?.toLowerCase().includes(s)) return false;
    }
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterPurpose !== 'all' && p.purpose !== filterPurpose) return false;
    return true;
  }), [properties, search, filterStatus, filterType, filterPurpose]);

  const visibleIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) visibleIds.forEach((id) => next.add(id));
      else visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-600',
      reserved: 'bg-blue-100 text-blue-700', sold: 'bg-purple-100 text-purple-700',
      rented: 'bg-indigo-100 text-indigo-700', paused: 'bg-amber-100 text-amber-700',
    };
    return colors[s] || 'bg-muted text-muted-foreground';
  };

  const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Imóveis</h1>
        {canEdit && (
          <Button asChild size="sm">
            <Link to="/admin/properties/new"><Plus className="h-4 w-4 mr-1" /> Novo Imóvel</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título, código ou bairro..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {PROPERTY_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                {PROPERTY_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPurpose} onValueChange={setFilterPurpose}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Finalidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {PROPERTY_PURPOSE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isAdmin && selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <div className="text-sm font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? 'imóvel selecionado' : 'imóveis selecionados'}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4 mr-1" /> Limpar seleção
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete({ ids: Array.from(selectedIds), bulk: true })}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Excluir selecionados
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Nenhum imóvel encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && (
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                          onCheckedChange={(v) => toggleAllVisible(!!v)}
                          aria-label="Selecionar todos"
                        />
                      </TableHead>
                    )}
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden sm:table-cell">Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Bairro</TableHead>
                    <TableHead className="w-28">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const checked = selectedIds.has(p.id);
                    return (
                      <TableRow key={p.id} data-state={checked ? 'selected' : undefined}>
                        {isAdmin && (
                          <TableCell className="p-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => toggleOne(p.id, !!v)}
                              aria-label={`Selecionar ${p.title}`}
                            />
                          </TableCell>
                        )}
                        <TableCell className="p-1">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" loading="lazy" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.code}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {p.is_featured && <Star className="h-3 w-3 inline mr-1 text-amber-500" />}
                          {p.title}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs capitalize">{p.type}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{formatPrice(p.price)}</TableCell>
                        <TableCell>
                          <button onClick={() => canEdit && toggleStatus(p.id, p.status)} className="cursor-pointer">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(p.status)}`}>
                              {PROPERTY_STATUS_OPTIONS.find((o) => o.value === p.status)?.label || p.status}
                            </span>
                          </button>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{p.neighborhood || '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/properties/${p.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/properties/${p.id}/edit`)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setConfirmDelete({ ids: [p.id], bulk: false })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && !deleting && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDelete?.bulk
                ? `Excluir ${confirmDelete.ids.length} imóveis?`
                : 'Excluir este imóvel?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os imóveis serão removidos permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => { e.preventDefault(); if (confirmDelete) performDelete(confirmDelete.ids); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
