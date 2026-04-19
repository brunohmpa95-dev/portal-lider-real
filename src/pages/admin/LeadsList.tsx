import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Trash2, Loader2, LayoutGrid, List, Phone, GripVertical, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { LEAD_FUNNEL_STAGES, LEAD_SOURCE_OPTIONS, LEAD_PRIORITY_OPTIONS } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LostReasonDialog from '@/components/admin/LostReasonDialog';

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  new: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', dot: 'bg-blue-500' },
  contact: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  visit: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500' },
  proposal: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', dot: 'bg-purple-500' },
  negotiation: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', dot: 'bg-orange-500' },
  closed: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', dot: 'bg-green-500' },
  lost: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600', dot: 'bg-red-400' },
};

export default function LeadsList() {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [pendingLost, setPendingLost] = useState<{ leadId: string; leadName: string } | null>(null);

  const isAdmin = roles.some((r) => ['administrativo', 'superadmin'].includes(r));

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('property_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setLeads(data || []);
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

  async function updateLeadStage(id: string, newStage: string, extra: Record<string, any> = {}) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, funnel_stage: newStage, ...extra } : l)));
    const { error } = await supabase.from('property_leads').update({ funnel_stage: newStage, ...extra } as any).eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message || 'Não foi possível mover o lead.', variant: 'destructive' });
      loadLeads();
      return false;
    }
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

  const filtered = leads.filter((l) => {
    if (search) {
      const s = search.toLowerCase();
      if (!l.name?.toLowerCase().includes(s) && !l.email?.toLowerCase().includes(s) && !l.phone?.includes(s)) return false;
    }
    if (filterStage !== 'all' && l.funnel_stage !== filterStage) return false;
    if (filterSource !== 'all' && l.source !== filterSource) return false;
    return true;
  });

  const stageLabel = (val: string) => LEAD_FUNNEL_STAGES.find((s) => s.value === val)?.label || val;

  const priorityColor = (p: string) => {
    if (p === 'urgent') return 'bg-red-100 text-red-700';
    if (p === 'high') return 'bg-orange-100 text-orange-700';
    return 'bg-muted text-muted-foreground';
  };

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

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
      { label: 'Total', value: total, icon: Users, color: 'text-foreground', dot: 'bg-foreground' },
      { label: 'Novos', value: newCount, icon: Users, color: STAGE_COLORS.new.text, dot: STAGE_COLORS.new.dot },
      { label: 'Contato', value: contactCount, icon: Users, color: STAGE_COLORS.contact.text, dot: STAGE_COLORS.contact.dot },
      { label: 'Proposta', value: proposalCount, icon: Users, color: STAGE_COLORS.proposal.text, dot: STAGE_COLORS.proposal.dot },
      { label: 'Fechados', value: closedCount, icon: TrendingUp, color: STAGE_COLORS.closed.text, dot: STAGE_COLORS.closed.dot },
      { label: 'Perdidos', value: lostCount, icon: TrendingDown, color: STAGE_COLORS.lost.text, dot: STAGE_COLORS.lost.dot },
      { label: 'Conversão', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-green-600', dot: 'bg-green-500' },
      { label: 'Perda', value: `${lostRate}%`, icon: TrendingDown, color: 'text-red-500', dot: 'bg-red-400' },
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

  const handleMobileMove = (lead: any, newStage: string) => {
    if (newStage === lead.funnel_stage) return;
    if (newStage === 'lost') {
      setPendingLost({ leadId: lead.id, leadName: lead.name });
      return;
    }
    updateLeadStage(lead.id, newStage);
  };

  const renderLeadCard = (lead: any, mobile = false) => {
    const colors = STAGE_COLORS[lead.funnel_stage] || STAGE_COLORS.new;
    return (
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
              {LEAD_SOURCE_OPTIONS.find((s) => s.value === lead.source)?.label || lead.source}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <div className="flex items-center gap-1 text-muted-foreground">
            {lead.phone && (
              <span className="flex items-center gap-0.5 text-[10px]">
                <Phone className="h-3 w-3" />
                {lead.phone}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {mobile ? (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <Select value={lead.funnel_stage} onValueChange={(v) => handleMobileMove(lead, v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Mover para..." />
              </SelectTrigger>
              <SelectContent>
                {LEAD_FUNNEL_STAGES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLead(lead.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

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
              <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                {stageLeads.length}
              </Badge>
            </div>

            <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
              {stageLeads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhum lead</p>
              ) : (
                stageLeads.map(renderLeadCard)
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
                stageLeads.map(renderLeadCard)
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  const renderTable = () => (
    <Card>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum lead encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">E-mail</TableHead>
                  <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="hidden lg:table-cell">Origem</TableHead>
                  <TableHead className="hidden lg:table-cell">Prioridade</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{lead.email}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{stageLabel(lead.funnel_stage)}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {LEAD_SOURCE_OPTIONS.find((s) => s.value === lead.source)?.label || lead.source}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor(lead.priority)}`}>
                        {LEAD_PRIORITY_OPTIONS.find((p) => p.value === lead.priority)?.label || lead.priority}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteLead(lead.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Leads</h1>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/leads/new"><Plus className="h-4 w-4 mr-1" /> Novo Lead</Link>
        </Button>
      </div>

      {!loading && renderMetrics()}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, e-mail ou telefone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {viewMode === 'table' && (
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Etapa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas etapas</SelectItem>
                  {LEAD_FUNNEL_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Origem" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas origens</SelectItem>
                {LEAD_SOURCE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
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
    </div>
  );
}
