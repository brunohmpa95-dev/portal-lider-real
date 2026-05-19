import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { logAudit } from '@/lib/audit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Search, Eye, Trash2, Loader2, LayoutGrid, List, Phone, GripVertical,
  TrendingUp, TrendingDown, Users, MoreHorizontal, MessageSquarePlus, MoveRight, Pencil,
} from 'lucide-react';
import {
  LEAD_FUNNEL_STAGES,
  LEAD_SOURCE_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_CHANNEL_OPTIONS,
  LEAD_TEMPERATURE_OPTIONS,
} from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LostReasonDialog from '@/components/admin/LostReasonDialog';
import QuickInteractionDialog from '@/components/admin/QuickInteractionDialog';
import { MobileTableCard, MobileTableRow } from '@/components/admin/MobileTableCard';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/admin/StateViews';
import { temperatureColor, funnelStageColor, channelLabel, sourceLabel } from '@/lib/leads';

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  new: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', dot: 'bg-blue-500' },
  contact: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  qualification: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  visit: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500' },
  proposal: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', dot: 'bg-purple-500' },
  negotiation: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', dot: 'bg-orange-500' },
  closed: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', dot: 'bg-green-500' },
  lost: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600', dot: 'bg-red-400' },
};

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Qualquer período' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
];
const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Mais recentes' },
  { value: 'created_asc', label: 'Mais antigos' },
  { value: 'updated_desc', label: 'Atualizados (recente)' },
  { value: 'updated_asc', label: 'Atualizados (antigo)' },
];
const PAGE_SIZE = 25;

function formatDateShort(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}
function formatDateTime(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function LeadsList() {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Dados
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<Record<string, { id: string; code: string; title: string }>>({});
  const [agents, setAgents] = useState<Record<string, { user_id: string; full_name: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  // UI
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [pendingLost, setPendingLost] = useState<{ leadId: string; leadName: string } | null>(null);
  const [interactionFor, setInteractionFor] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const isAdmin = roles.some((r) => ['administrativo', 'superadmin'].includes(r));

  useEffect(() => {
    loadAll();
  }, []);

  // Reset paginação quando filtros mudam
  useEffect(() => {
    setPage(1);
  }, [search, filterStage, filterSource, filterChannel, filterAgent, filterPeriod, sortBy]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    const [leadsRes, propsRes, profilesRes] = await Promise.all([
      supabase.from('property_leads').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('id, code, title').limit(1000),
      supabase.from('profiles').select('user_id, full_name').eq('is_active', true).limit(500),
    ]);
    if (leadsRes.error) {
      setError(leadsRes.error.message);
      setLoading(false);
      return;
    }
    setLeads(leadsRes.data || []);
    const propMap: Record<string, any> = {};
    (propsRes.data || []).forEach((p: any) => { propMap[p.id] = p; });
    setProperties(propMap);
    const agentMap: Record<string, any> = {};
    (profilesRes.data || []).forEach((p: any) => { agentMap[p.user_id] = p; });
    setAgents(agentMap);
    setLoading(false);
  }

  async function deleteLead(id: string) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    const { error } = await supabase.from('property_leads').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' });
    } else {
      toast({ title: 'Lead excluído' });
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function togglePageSelection(ids: string[], checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((i) => next.add(i));
      else ids.forEach((i) => next.delete(i));
      return next;
    });
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkDeleting(true);
    const { error } = await supabase.from('property_leads').delete().in('id', ids);
    setBulkDeleting(false);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    await logAudit('leads.bulk_delete', 'property_leads', 'property_leads', undefined, { count: ids.length, ids });
    setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    toast({ title: `${ids.length} lead${ids.length > 1 ? 's excluídos' : ' excluído'}` });
  }

  async function updateLeadStage(id: string, newStage: string, extra: Record<string, any> = {}) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, funnel_stage: newStage, ...extra } : l)));
    const { error } = await supabase.from('property_leads').update({ funnel_stage: newStage, ...extra } as any).eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message || 'Não foi possível mover o lead.', variant: 'destructive' });
      loadAll();
      return false;
    }
    toast({ title: 'Etapa atualizada' });
    return true;
  }

  async function confirmLost(reasonId: string, notes: string) {
    if (!pendingLost) return;
    const ok = await updateLeadStage(pendingLost.leadId, 'lost', {
      lost_reason_id: reasonId,
      lost_notes: notes || null,
    });
    if (ok) toast({ title: 'Lead marcado como perdido' });
    setPendingLost(null);
  }

  // Lista de corretores únicos a partir dos leads carregados (mais relevante para o filtro)
  const agentOptions = useMemo(() => {
    const ids = new Set<string>();
    leads.forEach((l) => l.assigned_to && ids.add(l.assigned_to));
    return Array.from(ids)
      .map((uid) => ({ uid, name: agents[uid]?.full_name || 'Sem nome' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [leads, agents]);

  // Filtragem + ordenação
  const filtered = useMemo(() => {
    const now = Date.now();
    const periodMs: Record<string, number | null> = {
      all: null,
      '7d': 7 * 86400000,
      '30d': 30 * 86400000,
      '90d': 90 * 86400000,
    };
    const cutoff = periodMs[filterPeriod];

    let arr = leads.filter((l) => {
      if (search) {
        const s = search.toLowerCase().trim();
        const propCode = l.property_id ? properties[l.property_id]?.code?.toLowerCase() : '';
        const matches =
          l.name?.toLowerCase().includes(s) ||
          l.email?.toLowerCase().includes(s) ||
          l.phone?.toLowerCase().includes(s) ||
          l.whatsapp?.toLowerCase().includes(s) ||
          (propCode && propCode.includes(s));
        if (!matches) return false;
      }
      if (filterStage !== 'all' && l.funnel_stage !== filterStage) return false;
      if (filterSource !== 'all' && l.source !== filterSource) return false;
      if (filterChannel !== 'all' && l.channel !== filterChannel) return false;
      if (filterAgent !== 'all') {
        if (filterAgent === 'unassigned') { if (l.assigned_to) return false; }
        else if (l.assigned_to !== filterAgent) return false;
      }
      if (cutoff && new Date(l.created_at).getTime() < now - cutoff) return false;
      return true;
    });

    arr = [...arr].sort((a, b) => {
      const fieldA = sortBy.startsWith('updated') ? a.updated_at : a.created_at;
      const fieldB = sortBy.startsWith('updated') ? b.updated_at : b.created_at;
      const ta = new Date(fieldA).getTime();
      const tb = new Date(fieldB).getTime();
      return sortBy.endsWith('asc') ? ta - tb : tb - ta;
    });
    return arr;
  }, [leads, properties, search, filterStage, filterSource, filterChannel, filterAgent, filterPeriod, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const stageLabel = (val: string) => LEAD_FUNNEL_STAGES.find((s) => s.value === val)?.label || val;
  const priorityColor = (p: string) => {
    if (p === 'urgent') return 'bg-red-100 text-red-700';
    if (p === 'high') return 'bg-orange-100 text-orange-700';
    return 'bg-muted text-muted-foreground';
  };

  // ---------- Kanban (mantido) ----------
  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }
  function handleDragLeave() { setDragOverStage(null); }
  function handleDrop(e: React.DragEvent, newStage: string) {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.funnel_stage === newStage) return;
    if (newStage === 'lost') {
      setPendingLost({ leadId, leadName: lead.name });
      return;
    }
    updateLeadStage(leadId, newStage);
  }
  const leadsForStage = (stage: string) => filtered.filter((l) => l.funnel_stage === stage);
  const handleMobileMove = (lead: any, newStage: string) => {
    if (newStage === lead.funnel_stage) return;
    if (newStage === 'lost') { setPendingLost({ leadId: lead.id, leadName: lead.name }); return; }
    updateLeadStage(lead.id, newStage);
  };

  const renderMetrics = () => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.funnel_stage === 'new').length;
    const contactCount = leads.filter((l) => l.funnel_stage === 'contact').length;
    const proposalCount = leads.filter((l) => l.funnel_stage === 'proposal').length;
    const closedCount = leads.filter((l) => l.funnel_stage === 'closed').length;
    const lostCount = leads.filter((l) => l.funnel_stage === 'lost').length;
    const conversionRate = total - lostCount > 0 ? ((closedCount / (total - lostCount)) * 100).toFixed(1) : '0.0';
    const lostRate = total > 0 ? ((lostCount / total) * 100).toFixed(1) : '0.0';
    const metrics = [
      { label: 'Total', value: total, color: 'text-foreground', dot: 'bg-foreground' },
      { label: 'Novos', value: newCount, color: STAGE_COLORS.new.text, dot: STAGE_COLORS.new.dot },
      { label: 'Contato', value: contactCount, color: STAGE_COLORS.contact.text, dot: STAGE_COLORS.contact.dot },
      { label: 'Proposta', value: proposalCount, color: STAGE_COLORS.proposal.text, dot: STAGE_COLORS.proposal.dot },
      { label: 'Fechados', value: closedCount, color: STAGE_COLORS.closed.text, dot: STAGE_COLORS.closed.dot },
      { label: 'Perdidos', value: lostCount, color: STAGE_COLORS.lost.text, dot: STAGE_COLORS.lost.dot },
      { label: 'Conversão', value: `${conversionRate}%`, color: 'text-green-600', dot: 'bg-green-500' },
      { label: 'Perda', value: `${lostRate}%`, color: 'text-red-500', dot: 'bg-red-400' },
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card border rounded-lg p-3 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${m.dot} shrink-0`} />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">{m.label}</p>
              <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLeadCard = (lead: any, mobile = false) => (
    <div
      key={lead.id}
      draggable={!mobile}
      onDragStart={(e) => !mobile && handleDragStart(e, lead.id)}
      onClick={() => navigate(`/admin/leads/${lead.id}`)}
      className={`bg-card border rounded-lg p-3 hover:shadow-md transition-shadow group ${mobile ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{lead.name}</p>
          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
        </div>
        {!mobile && <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColor(lead.priority)}`}>
          {LEAD_PRIORITY_OPTIONS.find((p) => p.value === lead.priority)?.label || lead.priority}
        </span>
        {lead.source && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {sourceLabel(lead.source)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t">
        <div className="flex items-center gap-1 text-muted-foreground">
          {(lead.whatsapp || lead.phone) && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <Phone className="h-3 w-3" />
              {lead.whatsapp || lead.phone}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{formatDateShort(lead.created_at)}</span>
      </div>
      {mobile && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <Select value={lead.funnel_stage} onValueChange={(v) => handleMobileMove(lead, v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Mover para..." /></SelectTrigger>
            <SelectContent>
              {LEAD_FUNNEL_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderKanbanDesktop = () => (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
      {LEAD_FUNNEL_STAGES.map((stage) => {
        const colors = STAGE_COLORS[stage.value] || STAGE_COLORS.new;
        const stageLeads = leadsForStage(stage.value);
        const isDragOver = dragOverStage === stage.value;
        return (
          <div
            key={stage.value}
            className={`min-w-[280px] w-[280px] flex-shrink-0 rounded-xl border-2 transition-colors ${isDragOver ? colors.border + ' ' + colors.bg : 'border-border bg-muted/30'}`}
            onDragOver={(e) => handleDragOver(e, stage.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.value)}
          >
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-lg ${colors.bg}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
              <span className={`text-sm font-semibold ${colors.text}`}>{stage.label}</span>
              <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">{stageLeads.length}</Badge>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
              {stageLeads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhum lead</p>
              ) : (
                stageLeads.map((l) => renderLeadCard(l, false))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderKanbanMobile = () => (
    <Accordion type="multiple" defaultValue={LEAD_FUNNEL_STAGES.filter((s) => leadsForStage(s.value).length > 0).map((s) => s.value)}>
      {LEAD_FUNNEL_STAGES.map((stage) => {
        const colors = STAGE_COLORS[stage.value] || STAGE_COLORS.new;
        const stageLeads = leadsForStage(stage.value);
        return (
          <AccordionItem key={stage.value} value={stage.value} className="border rounded-lg mb-2">
            <AccordionTrigger className={`px-3 py-2 rounded-t-lg hover:no-underline ${colors.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                <span className={`text-sm font-semibold ${colors.text}`}>{stage.label}</span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{stageLeads.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-2 space-y-2">
              {stageLeads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum lead</p>
              ) : (
                stageLeads.map((l) => renderLeadCard(l, true))
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  // ---------- Ações rápidas ----------
  const StageMover = ({ lead }: { lead: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} aria-label="Ações">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => navigate(`/admin/leads/${lead.id}`)}>
          <Eye className="h-4 w-4 mr-2" /> Visualizar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(`/admin/leads/${lead.id}?edit=1`)}>
          <Pencil className="h-4 w-4 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setInteractionFor({ id: lead.id, name: lead.name })}>
          <MessageSquarePlus className="h-4 w-4 mr-2" /> Registrar interação
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Mover para etapa</DropdownMenuLabel>
        {LEAD_FUNNEL_STAGES.filter((s) => s.value !== lead.funnel_stage).map((s) => (
          <DropdownMenuItem key={s.value} onSelect={() => {
            if (s.value === 'lost') { setPendingLost({ leadId: lead.id, leadName: lead.name }); return; }
            updateLeadStage(lead.id, s.value);
          }}>
            <MoveRight className="h-4 w-4 mr-2" /> {s.label}
          </DropdownMenuItem>
        ))}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => deleteLead(lead.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ---------- Tabela desktop ----------
  const renderTableDesktop = () => (
    <div className="hidden md:block">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={paged.length > 0 && paged.every((l) => selectedIds.has(l.id))}
                        onCheckedChange={(c) => togglePageSelection(paged.map((l) => l.id), !!c)}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                  )}
                  <TableHead>Lead</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="hidden lg:table-cell">Interesse</TableHead>
                  <TableHead className="hidden lg:table-cell">Imóvel</TableHead>
                  <TableHead className="hidden xl:table-cell">Corretor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Atualizado</TableHead>
                  <TableHead className="w-12 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((lead) => {
                  const prop = lead.property_id ? properties[lead.property_id] : null;
                  const agent = lead.assigned_to ? agents[lead.assigned_to] : null;
                  return (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                      {isAdmin && (
                        <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
                          <Checkbox
                            checked={selectedIds.has(lead.id)}
                            onCheckedChange={() => toggleSelect(lead.id)}
                            aria-label={`Selecionar ${lead.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="font-medium">{lead.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${temperatureColor(lead.temperature)}`}>
                            {LEAD_TEMPERATURE_OPTIONS.find((t) => t.value === lead.temperature)?.label || 'Frio'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="truncate max-w-[180px]">{lead.email}</div>
                        <div>{lead.whatsapp || lead.phone || '—'}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{sourceLabel(lead.source)}</div>
                        {lead.channel && <div className="text-muted-foreground">{channelLabel(lead.channel)}</div>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {lead.interest_purpose || lead.interest_property_type
                          ? `${lead.interest_purpose === 'sale' ? 'Compra' : lead.interest_purpose === 'rent' ? 'Aluguel' : ''} ${lead.interest_property_type || ''}`.trim()
                          : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">
                        {prop ? (
                          <Link to={`/admin/properties/${prop.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            {prop.code}
                          </Link>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                        {agent?.full_name || (lead.assigned_to ? '—' : <span className="italic">Sem corretor</span>)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${funnelStageColor(lead.funnel_stage)}`}>
                          {stageLabel(lead.funnel_stage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDateTime(lead.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <StageMover lead={lead} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ---------- Tabela mobile (cards) ----------
  const renderTableMobile = () => (
    <div className="md:hidden space-y-2">
      {paged.map((lead) => {
        const prop = lead.property_id ? properties[lead.property_id] : null;
        const agent = lead.assigned_to ? agents[lead.assigned_to] : null;
        return (
          <MobileTableCard key={lead.id} onClick={() => navigate(`/admin/leads/${lead.id}`)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{lead.name}</div>
                <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <StageMover lead={lead} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant="outline" className={`text-[10px] ${funnelStageColor(lead.funnel_stage)}`}>
                {stageLabel(lead.funnel_stage)}
              </Badge>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${temperatureColor(lead.temperature)}`}>
                {LEAD_TEMPERATURE_OPTIONS.find((t) => t.value === lead.temperature)?.label || 'Frio'}
              </span>
              {lead.source && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {sourceLabel(lead.source)}
                </span>
              )}
            </div>
            <div className="mt-2 space-y-0.5">
              <MobileTableRow label="Contato" value={lead.whatsapp || lead.phone || '—'} />
              <MobileTableRow label="Imóvel" value={prop ? prop.code : '—'} />
              <MobileTableRow label="Corretor" value={agent?.full_name || (lead.assigned_to ? '—' : 'Sem corretor')} />
              <MobileTableRow label="Atualizado" value={formatDateShort(lead.updated_at)} />
            </div>
          </MobileTableCard>
        );
      })}
    </div>
  );

  const renderTable = () => {
    if (filtered.length === 0) {
      return (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              title="Nenhum lead encontrado"
              description="Ajuste os filtros ou cadastre um novo lead para começar."
              action={
                <Button asChild size="sm">
                  <Link to="/admin/leads/new"><Plus className="h-4 w-4 mr-1" /> Novo Lead</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      );
    }
    return (
      <>
        {renderTableDesktop()}
        {renderTableMobile()}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-xs text-muted-foreground">
              {filtered.length} resultado{filtered.length === 1 ? '' : 's'} · página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </Button>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Leads</h1>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode('table')}
              aria-label="Visualização em lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode('kanban')}
              aria-label="Visualização em kanban"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/leads/new"><Plus className="h-4 w-4 mr-1" /> Novo Lead</Link>
        </Button>
      </div>

      {isAdmin && selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 shadow-sm">
          <span className="text-sm font-medium">
            {selectedIds.size} lead{selectedIds.size > 1 ? 's selecionados' : ' selecionado'}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Limpar seleção
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Excluir selecionados
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && renderMetrics()}



      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail, telefone, WhatsApp ou código do imóvel..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger><SelectValue placeholder="Etapa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas etapas</SelectItem>
                {LEAD_FUNNEL_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas origens</SelectItem>
                {LEAD_SOURCE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger><SelectValue placeholder="Canal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos canais</SelectItem>
                {LEAD_CHANNEL_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger><SelectValue placeholder="Corretor" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todos corretores</SelectItem>
                <SelectItem value="unassigned">Sem corretor</SelectItem>
                {agentOptions.map((a) => <SelectItem key={a.uid} value={a.uid}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="p-3 sm:p-4"><ListSkeleton rows={6} /></CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-0"><ErrorState description={error} onRetry={loadAll} /></CardContent></Card>
      ) : viewMode === 'kanban' ? (
        isMobile ? renderKanbanMobile() : renderKanbanDesktop()
      ) : (
        renderTable()
      )}

      <LostReasonDialog
        open={!!pendingLost}
        leadName={pendingLost?.leadName}
        onCancel={() => setPendingLost(null)}
        onConfirm={confirmLost}
      />

      <QuickInteractionDialog
        leadId={interactionFor?.id || null}
        leadName={interactionFor?.name}
        open={!!interactionFor}
        onOpenChange={(o) => { if (!o) setInteractionFor(null); }}
      />

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados, interações e histórico dos leads selecionados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); bulkDelete(); }}
              disabled={bulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
