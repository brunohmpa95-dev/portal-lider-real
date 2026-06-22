import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Search, Eye, Edit, Trash2, Loader2, Star, X, Archive, ArchiveRestore,
  CalendarIcon, MoreHorizontal, Upload, History, MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROPERTY_STATUS_OPTIONS, PROPERTY_TYPE_OPTIONS, PROPERTY_PURPOSE_OPTIONS } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/audit';

type ArchiveStateFilter = 'active' | 'archived' | 'all';
type DateField = 'created_at' | 'updated_at';

export default function PropertiesList() {
  const { roles, user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [whatsappClicks, setWhatsappClicks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPurpose, setFilterPurpose] = useState('all');
  const [filterArchive, setFilterArchive] = useState<ArchiveStateFilter>('active');
  const [dateField, setDateField] = useState<DateField>('created_at');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialogs
  const [archiveDialog, setArchiveDialog] = useState<{ ids: string[]; bulk: boolean; filtered?: boolean } | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [unarchiveDialog, setUnarchiveDialog] = useState<{ ids: string[]; filtered?: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; bulk: boolean } | null>(null);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [working, setWorking] = useState(false);

  const isAdmin = roles.some((r) => ['administrativo', 'superadmin'].includes(r));
  const canEdit = roles.some((r) => ['corretor', 'vendas', 'administrativo', 'superadmin'].includes(r));

  useEffect(() => { loadProperties(); }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [search, filterStatus, filterType, filterPurpose, filterArchive, dateField, dateFrom, dateTo]);

  async function loadProperties() {
    setLoading(true);
    const [{ data }, { data: clicksData }] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('whatsapp_clicks').select('property_id').not('property_id', 'is', null),
    ]);

    const clicksMap = (clicksData || []).reduce<Record<string, number>>((acc, click) => {
      if (click.property_id) {
        acc[click.property_id] = (acc[click.property_id] || 0) + 1;
      }
      return acc;
    }, {});

    setProperties(data || []);
    setWhatsappClicks(clicksMap);
    setLoading(false);
  }

  async function performArchive(ids: string[], reason: string) {
    setWorking(true);
    const { error } = await supabase
      .from('properties')
      .update({
        archived_at: new Date().toISOString(),
        archived_by: user?.id || null,
        archived_reason: reason || null,
      } as any)
      .in('id', ids);
    setWorking(false);
    if (error) {
      toast({ title: 'Erro ao arquivar', description: error.message, variant: 'destructive' });
      return;
    }
    await logAudit('property.archive', 'properties', 'property', ids.join(','), { count: ids.length, reason });
    toast({ title: ids.length > 1 ? `${ids.length} imóveis arquivados` : 'Imóvel arquivado' });
    setProperties((p) => p.map((x) => ids.includes(x.id)
      ? { ...x, archived_at: new Date().toISOString(), archived_by: user?.id, archived_reason: reason || null }
      : x));
    setSelectedIds(new Set());
    setArchiveDialog(null);
    setArchiveReason('');
  }

  async function performUnarchive(ids: string[]) {
    setWorking(true);
    const { error } = await supabase
      .from('properties')
      .update({ archived_at: null, archived_by: null, archived_reason: null } as any)
      .in('id', ids);
    setWorking(false);
    if (error) {
      toast({ title: 'Erro ao desarquivar', description: error.message, variant: 'destructive' });
      return;
    }
    await logAudit('property.unarchive', 'properties', 'property', ids.join(','), { count: ids.length });
    toast({ title: ids.length > 1 ? `${ids.length} imóveis desarquivados` : 'Imóvel desarquivado' });
    setProperties((p) => p.map((x) => ids.includes(x.id)
      ? { ...x, archived_at: null, archived_by: null, archived_reason: null }
      : x));
    setSelectedIds(new Set());
    setUnarchiveDialog(null);
  }

  async function performDelete(ids: string[]) {
    setWorking(true);
    const { error } = await supabase.from('properties').delete().in('id', ids);
    setWorking(false);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    await logAudit('property.delete', 'properties', 'property', ids.join(','), { count: ids.length });
    toast({ title: ids.length > 1 ? `${ids.length} imóveis excluídos` : 'Imóvel excluído' });
    setProperties((p) => p.filter((x) => !ids.includes(x.id)));
    setSelectedIds(new Set());
    setConfirmDelete(null);
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === 'published' ? 'paused' : 'published';
    const { error } = await supabase.from('properties').update({ status: next }).eq('id', id);
    if (!error) setProperties((p) => p.map((x) => x.id === id ? { ...x, status: next } : x));
  }

  async function openHistory(id: string) {
    setHistoryOpen(id);
    setHistoryLoading(true);
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .eq('target_type', 'property')
      .ilike('target_id', `%${id}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    setHistoryEntries(data || []);
    setHistoryLoading(false);
  }

  const filtered = useMemo(() => properties.filter((p) => {
    if (filterArchive === 'active' && p.archived_at) return false;
    if (filterArchive === 'archived' && !p.archived_at) return false;

    if (search) {
      const s = search.toLowerCase();
      if (!p.title?.toLowerCase().includes(s) && !p.code?.toLowerCase().includes(s) && !p.neighborhood?.toLowerCase().includes(s)) return false;
    }
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterPurpose !== 'all' && p.purpose !== filterPurpose) return false;

    if (dateFrom || dateTo) {
      const v = p[dateField] ? new Date(p[dateField]) : null;
      if (!v) return false;
      if (dateFrom && v < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo); end.setHours(23, 59, 59, 999);
        if (v > end) return false;
      }
    }
    return true;
  }), [properties, search, filterStatus, filterType, filterPurpose, filterArchive, dateField, dateFrom, dateTo]);

  const visibleIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  const selectedArr = useMemo(() => properties.filter((p) => selectedIds.has(p.id)), [properties, selectedIds]);
  const selectedHasArchived = selectedArr.some((p) => p.archived_at);
  const selectedHasActive = selectedArr.some((p) => !p.archived_at);

  const hasActiveFilters = !!(search || filterStatus !== 'all' || filterType !== 'all'
    || filterPurpose !== 'all' || filterArchive !== 'active' || dateFrom || dateTo);

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
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }

  function clearDates() { setDateFrom(undefined); setDateTo(undefined); }

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Imóveis</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/properties/import"><Upload className="h-4 w-4 mr-1" /> Importar CSV</Link>
            </Button>
          )}
          {canEdit && (
            <Button asChild size="sm">
              <Link to="/admin/properties/new"><Plus className="h-4 w-4 mr-1" /> Novo Imóvel</Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título, código ou bairro..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterArchive} onValueChange={(v) => setFilterArchive(v as ArchiveStateFilter)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Apenas ativos</SelectItem>
                <SelectItem value="archived">Apenas arquivados</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <span className="text-xs font-medium text-muted-foreground">Filtrar por data:</span>
            <Select value={dateField} onValueChange={(v) => setDateField(v as DateField)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Cadastro</SelectItem>
                <SelectItem value="updated_at">Atualização</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn('justify-start font-normal w-full sm:w-40', !dateFrom && 'text-muted-foreground')}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'De'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn('p-3 pointer-events-auto')} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn('justify-start font-normal w-full sm:w-40', !dateTo && 'text-muted-foreground')}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Até'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn('p-3 pointer-events-auto')} />
              </PopoverContent>
            </Popover>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={clearDates}>
                <X className="h-4 w-4 mr-1" /> Limpar datas
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk action bar — selection */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <div className="text-sm font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? 'imóvel selecionado' : 'imóveis selecionados'}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4 mr-1" /> Limpar seleção
            </Button>
            {selectedHasActive && (
              <Button variant="outline" size="sm" onClick={() => setArchiveDialog({ ids: Array.from(selectedIds), bulk: true })}>
                <Archive className="h-4 w-4 mr-1" /> Arquivar
              </Button>
            )}
            {selectedHasArchived && (
              <Button variant="outline" size="sm" onClick={() => setUnarchiveDialog({ ids: Array.from(selectedIds) })}>
                <ArchiveRestore className="h-4 w-4 mr-1" /> Desarquivar
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete({ ids: Array.from(selectedIds), bulk: true })}>
              <Trash2 className="h-4 w-4 mr-1" /> Excluir definitivo
            </Button>
          </div>
        </div>
      )}

      {/* Bulk action bar — filtered (no selection needed) */}
      {isAdmin && hasActiveFilters && filtered.length > 0 && selectedIds.size === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-card px-4 py-3">
          <div className="text-sm">
            <span className="font-medium">{filtered.length}</span>{' '}
            <span className="text-muted-foreground">
              {filtered.length === 1 ? 'imóvel corresponde' : 'imóveis correspondem'} aos filtros atuais
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterArchive !== 'archived' && (
              <Button variant="outline" size="sm"
                onClick={() => setArchiveDialog({ ids: filtered.filter((p) => !p.archived_at).map((p) => p.id), bulk: true, filtered: true })}
                disabled={!filtered.some((p) => !p.archived_at)}>
                <Archive className="h-4 w-4 mr-1" /> Arquivar todos os filtrados
              </Button>
            )}
            {filterArchive !== 'active' && filtered.some((p) => p.archived_at) && (
              <Button variant="outline" size="sm"
                onClick={() => setUnarchiveDialog({ ids: filtered.filter((p) => p.archived_at).map((p) => p.id), filtered: true })}>
                <ArchiveRestore className="h-4 w-4 mr-1" /> Desarquivar todos os filtrados
              </Button>
            )}
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
                    <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                    <TableHead className="w-28">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const checked = selectedIds.has(p.id);
                    const archived = !!p.archived_at;
                    return (
                      <TableRow key={p.id} data-state={checked ? 'selected' : undefined} className={archived ? 'opacity-60' : undefined}>
                        {isAdmin && (
                          <TableCell className="p-2">
                            <Checkbox checked={checked} onCheckedChange={(v) => toggleOne(p.id, !!v)} aria-label={`Selecionar ${p.title}`} />
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
                        <TableCell className="font-medium max-w-[220px] truncate">
                          {p.is_featured && <Star className="h-3 w-3 inline mr-1 text-amber-500" />}
                          <span className="align-middle">{p.title}</span>
                          {(whatsappClicks[p.id] || 0) > 0 && (
                            <span
                              className="ml-2 inline-flex items-center gap-0.5 align-middle text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700"
                              title={`${whatsappClicks[p.id]} clique(s) no WhatsApp`}
                            >
                              <MessageCircle className="h-3 w-3" />
                              {whatsappClicks[p.id]}
                            </span>
                          )}
                          {archived && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              Arquivado
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs capitalize">{p.type}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{formatPrice(p.price)}</TableCell>
                        <TableCell>
                          <button onClick={() => canEdit && !archived && toggleStatus(p.id, p.status)} className={archived ? '' : 'cursor-pointer'} disabled={archived}>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(p.status)}`}>
                              {PROPERTY_STATUS_OPTIONS.find((o) => o.value === p.status)?.label || p.status}
                            </span>
                          </button>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{p.neighborhood || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                          {p.created_at ? format(new Date(p.created_at), 'dd/MM/yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/properties/${p.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit && !archived && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/properties/${p.id}/edit`)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!archived ? (
                                    <DropdownMenuItem onClick={() => setArchiveDialog({ ids: [p.id], bulk: false })}>
                                      <Archive className="h-4 w-4 mr-2" /> Arquivar
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => setUnarchiveDialog({ ids: [p.id] })}>
                                      <ArchiveRestore className="h-4 w-4 mr-2" /> Desarquivar
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => openHistory(p.id)}>
                                    <History className="h-4 w-4 mr-2" /> Ver histórico
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setConfirmDelete({ ids: [p.id], bulk: false })}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir definitivo
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      {/* Archive dialog */}
      <Dialog open={!!archiveDialog} onOpenChange={(o) => !o && !working && (setArchiveDialog(null), setArchiveReason(''))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {archiveDialog?.bulk
                ? `Arquivar ${archiveDialog.ids.length} ${archiveDialog.ids.length === 1 ? 'imóvel' : 'imóveis'}?`
                : 'Arquivar este imóvel?'}
            </DialogTitle>
            <DialogDescription>
              {archiveDialog?.filtered
                ? 'Esta ação afeta apenas os imóveis listados acima (filtros atuais).'
                : 'Imóveis arquivados deixam de aparecer no site público, mas podem ser restaurados a qualquer momento.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo (opcional)</label>
            <Textarea
              placeholder="Ex.: vendido fora do portal, retirado pelo proprietário..."
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setArchiveDialog(null); setArchiveReason(''); }} disabled={working}>Cancelar</Button>
            <Button onClick={() => archiveDialog && performArchive(archiveDialog.ids, archiveReason)} disabled={working}>
              {working ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Archive className="h-4 w-4 mr-1" />}
              Arquivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unarchive dialog */}
      <AlertDialog open={!!unarchiveDialog} onOpenChange={(o) => !o && !working && setUnarchiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Desarquivar {unarchiveDialog?.ids.length} {unarchiveDialog?.ids.length === 1 ? 'imóvel' : 'imóveis'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os imóveis voltam a ficar disponíveis para edição e poderão aparecer no site público se estiverem publicados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={working}
              onClick={(e) => { e.preventDefault(); unarchiveDialog && performUnarchive(unarchiveDialog.ids); }}>
              {working ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArchiveRestore className="h-4 w-4 mr-1" />}
              Desarquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard delete dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && !working && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDelete?.bulk
                ? `Excluir ${confirmDelete.ids.length} imóveis permanentemente?`
                : 'Excluir este imóvel permanentemente?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Considere arquivar antes — imóveis arquivados podem ser restaurados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={working}
              onClick={(e) => { e.preventDefault(); confirmDelete && performDelete(confirmDelete.ids); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {working ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Excluir definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History dialog */}
      <Dialog open={!!historyOpen} onOpenChange={(o) => !o && (setHistoryOpen(null), setHistoryEntries([]))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico do imóvel</DialogTitle>
            <DialogDescription>Últimas ações registradas para este imóvel.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {historyLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : historyEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro de auditoria encontrado.</p>
            ) : (
              <ul className="space-y-2">
                {historyEntries.map((h) => (
                  <li key={h.id} className="border border-border rounded-md p-3 text-sm">
                    <div className="flex justify-between gap-3 mb-1">
                      <span className="font-medium">{h.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {h.created_at ? format(new Date(h.created_at), 'dd/MM/yyyy HH:mm') : ''}
                      </span>
                    </div>
                    {h.metadata && Object.keys(h.metadata).length > 0 && (
                      <pre className="text-xs text-muted-foreground bg-muted/50 rounded p-2 overflow-x-auto">
                        {JSON.stringify(h.metadata, null, 2)}
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
