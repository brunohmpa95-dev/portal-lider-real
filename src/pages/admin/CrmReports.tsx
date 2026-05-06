import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, Users, Award, Target, MessageCircle, TrendingDown, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { toast } from '@/hooks/use-toast';

const COLORS = ['hsl(var(--primary))', '#60a5fa', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6', '#14b8a6'];

const SOURCE_LABEL: Record<string, string> = {
  website: 'Site', whatsapp: 'WhatsApp', phone: 'Telefone', referral: 'Indicação',
  social: 'Redes', portal: 'Portal', walk_in: 'Presencial', other: 'Outro',
};
const STAGE_LABEL: Record<string, string> = {
  new: 'Novo', contact: 'Contato', qualification: 'Qualificação', visit: 'Visita',
  proposal: 'Proposta', negotiation: 'Negociação', closed: 'Fechado', lost: 'Perdido',
};
const STAGE_ORDER = ['new', 'contact', 'qualification', 'visit', 'proposal', 'negotiation', 'closed', 'lost'];

type Period = 7 | 30 | 90 | 365;

function toCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) { toast({ title: 'Nada para exportar' }); return; }
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const csv = [headers.join(';'), ...rows.map((r) => headers.map((h) => escape(r[h])).join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function CrmReports() {
  const [period, setPeriod] = useState<Period>(30);
  const [filterBroker, setFilterBroker] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [stageEvents, setStageEvents] = useState<any[]>([]);
  const [agents, setAgents] = useState<{ user_id: string; full_name: string | null }[]>([]);

  useEffect(() => { load(); }, [period]);

  async function load() {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - period);
    const sinceStr = since.toISOString();

    const [leadsRes, intRes, agentsRes, stageRes] = await Promise.all([
      supabase.from('property_leads')
        .select('id, name, source, funnel_stage, assigned_to, created_at, updated_at, lost_at')
        .gte('created_at', sinceStr),
      supabase.from('lead_interactions')
        .select('id, lead_id, interaction_type, user_id, created_at, funnel_stage_at_time')
        .gte('created_at', sinceStr),
      supabase.from('profiles').select('user_id, full_name').eq('is_active', true).order('full_name'),
      supabase.from('lead_interactions')
        .select('lead_id, interaction_type, content, created_at, funnel_stage_at_time')
        .eq('interaction_type', 'stage_change')
        .gte('created_at', sinceStr),
    ]);

    setLeads(leadsRes.data || []);
    setInteractions(intRes.data || []);
    setAgents((agentsRes.data as any) || []);
    setStageEvents(stageRes.data || []);
    setLoading(false);
  }

  // Apply filters
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filterBroker !== 'all' && l.assigned_to !== filterBroker) return false;
      if (filterSource !== 'all' && (l.source || 'other') !== filterSource) return false;
      if (filterStage !== 'all' && (l.funnel_stage || 'new') !== filterStage) return false;
      return true;
    });
  }, [leads, filterBroker, filterSource, filterStage]);

  const filteredInt = useMemo(() => {
    const ids = new Set(filtered.map((l) => l.id));
    return interactions.filter((i) => ids.has(i.lead_id));
  }, [interactions, filtered]);

  const agentName = (id: string) => agents.find((a) => a.user_id === id)?.full_name || '—';

  // === KPIs ===
  const won = filtered.filter((l) => l.funnel_stage === 'closed').length;
  const lost = filtered.filter((l) => l.funnel_stage === 'lost').length;
  const conversion = filtered.length ? +((won / filtered.length) * 100).toFixed(1) : 0;
  const whatsappLeads = filtered.filter((l) => l.source === 'whatsapp').length;
  const wonLossRatio = lost > 0 ? +(won / lost).toFixed(2) : won;

  // === Distribuições ===
  const bySource = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach((l) => { const k = l.source || 'other'; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ name: SOURCE_LABEL[k] || k, key: k, value: v }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const byStage = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach((l) => { const k = l.funnel_stage || 'new'; m[k] = (m[k] || 0) + 1; });
    return STAGE_ORDER.filter((k) => m[k]).map((k) => ({ name: STAGE_LABEL[k], key: k, value: m[k] }));
  }, [filtered]);

  const byBroker = useMemo(() => {
    const m: Record<string, { leads: number; won: number; lost: number }> = {};
    filtered.forEach((l) => {
      if (!l.assigned_to) return;
      m[l.assigned_to] ||= { leads: 0, won: 0, lost: 0 };
      m[l.assigned_to].leads++;
      if (l.funnel_stage === 'closed') m[l.assigned_to].won++;
      if (l.funnel_stage === 'lost') m[l.assigned_to].lost++;
    });
    return Object.entries(m)
      .map(([id, v]) => ({ id, name: agentName(id), ...v, conversao: v.leads ? +((v.won / v.leads) * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.won - a.won || b.leads - a.leads);
  }, [filtered, agents]);

  // Tempo médio por etapa: usa stage_change events para calcular dwell time
  const avgTimePerStage = useMemo(() => {
    const byLead: Record<string, { stage: string; at: number }[]> = {};
    const ids = new Set(filtered.map((l) => l.id));
    // start: created_at => "new"
    filtered.forEach((l) => {
      byLead[l.id] = [{ stage: 'new', at: new Date(l.created_at).getTime() }];
    });
    stageEvents
      .filter((e) => ids.has(e.lead_id))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .forEach((e) => {
        // content like "Etapa: Novo → Contato"
        const m = /→\s*(.+)$/.exec(e.content || '');
        const label = m?.[1]?.trim();
        const key = Object.entries(STAGE_LABEL).find(([, v]) => v === label)?.[0];
        if (key && byLead[e.lead_id]) {
          byLead[e.lead_id].push({ stage: key, at: new Date(e.created_at).getTime() });
        }
      });
    const totals: Record<string, { sum: number; n: number }> = {};
    Object.values(byLead).forEach((seq) => {
      for (let i = 0; i < seq.length - 1; i++) {
        const stage = seq[i].stage;
        const dur = seq[i + 1].at - seq[i].at;
        totals[stage] ||= { sum: 0, n: 0 };
        totals[stage].sum += dur;
        totals[stage].n++;
      }
    });
    return STAGE_ORDER
      .filter((s) => totals[s])
      .map((s) => ({ name: STAGE_LABEL[s], hours: +(totals[s].sum / totals[s].n / 3600000).toFixed(1) }));
  }, [filtered, stageEvents]);

  // Interactions over time (daily)
  const interactionsTimeline = useMemo(() => {
    const m: Record<string, number> = {};
    filteredInt.forEach((i) => {
      const d = new Date(i.created_at);
      const k = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).map(([day, count]) => ({ day, count }));
  }, [filteredInt]);

  const interactionsByType = useMemo(() => {
    const m: Record<string, number> = {};
    filteredInt.forEach((i) => { m[i.interaction_type] = (m[i.interaction_type] || 0) + 1; });
    const labels: Record<string, string> = {
      whatsapp: 'WhatsApp', call: 'Ligação', email: 'E-mail', visit: 'Visita',
      meeting: 'Reunião', note: 'Observação', stage_change: 'Mudança de etapa',
    };
    return Object.entries(m).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [filteredInt]);

  // === Exports ===
  function exportLeads() {
    toCSV(filtered.map((l) => ({
      id: l.id, nome: l.name, origem: SOURCE_LABEL[l.source] || l.source,
      etapa: STAGE_LABEL[l.funnel_stage] || l.funnel_stage, corretor: agentName(l.assigned_to),
      criado_em: l.created_at, atualizado_em: l.updated_at,
    })), 'crm_leads');
  }
  function exportBroker() { toCSV(byBroker.map(({ id, ...r }) => r), 'leads_por_corretor'); }
  function exportSource() { toCSV(bySource.map(({ key, ...r }) => r), 'leads_por_origem'); }
  function exportStage() { toCSV(byStage.map(({ key, ...r }) => r), 'leads_por_etapa'); }
  function exportInteractions() {
    toCSV(filteredInt.map((i) => ({
      data: i.created_at, lead_id: i.lead_id, tipo: i.interaction_type,
      usuario: agentName(i.user_id), etapa: STAGE_LABEL[i.funnel_stage_at_time] || i.funnel_stage_at_time,
    })), 'interacoes');
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <InternalPageHeader title="Relatórios CRM" subtitle="Acompanhamento comercial, conversão e produtividade" />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-xs">Período</Label>
            <Tabs value={String(period)} onValueChange={(v) => setPeriod(Number(v) as Period)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="7">7d</TabsTrigger>
                <TabsTrigger value="30">30d</TabsTrigger>
                <TabsTrigger value="90">90d</TabsTrigger>
                <TabsTrigger value="365">1 ano</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Corretor</Label>
            <Select value={filterBroker} onValueChange={setFilterBroker}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {agents.map((a) => <SelectItem key={a.user_id} value={a.user_id}>{a.full_name || a.user_id.slice(0, 8)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Origem</Label>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(SOURCE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Etapa</Label>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {STAGE_ORDER.map((k) => <SelectItem key={k} value={k}>{STAGE_LABEL[k]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon={Users} label="Leads" value={filtered.length} />
        <Kpi icon={Award} label="Ganhos" value={won} className="text-emerald-600" />
        <Kpi icon={TrendingDown} label="Perdidos" value={lost} className="text-destructive" />
        <Kpi icon={Target} label="Conversão" value={`${conversion}%`} />
        <Kpi icon={MessageCircle} label="WhatsApp" value={whatsappLeads} />
        <Kpi icon={Clock} label="Ganho/Perda" value={wonLossRatio} />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportLeads}>
          <Download className="h-4 w-4 mr-1" /> Exportar leads filtrados (CSV)
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Leads por origem" onExport={exportSource}>
          {bySource.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={bySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="75%"
                     label={({ name, value }) => `${name}: ${value}`}>
                  {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        <ChartCard title="Leads por etapa do funil" onExport={exportStage}>
          {byStage.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byStage} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        <ChartCard title="Leads por corretor" onExport={exportBroker}>
          {byBroker.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byBroker.slice(0, 10)} margin={{ top: 5, right: 10, left: -20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="leads" fill="#60a5fa" name="Leads" />
                <Bar dataKey="won" fill="hsl(var(--primary))" name="Ganhos" />
                <Bar dataKey="lost" fill="#ef4444" name="Perdidos" />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        <ChartCard title="Tempo médio por etapa (horas)">
          {avgTimePerStage.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={avgTimePerStage} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${v}h`} />
                <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty msg="Sem mudanças de etapa registradas" />}
        </ChartCard>

        <ChartCard title="Interações por dia" onExport={exportInteractions}>
          {interactionsTimeline.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={interactionsTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        <ChartCard title="Interações por tipo">
          {interactionsByType.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={interactionsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="75%"
                     label={({ name, value }) => `${name}: ${value}`}>
                  {interactionsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>
      </div>

      {/* Tabela compacta corretores */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Performance por corretor</CardTitle>
          <Button variant="ghost" size="sm" onClick={exportBroker}><Download className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-muted-foreground text-xs">
                <th className="py-2">Corretor</th>
                <th className="py-2 text-right">Leads</th>
                <th className="py-2 text-right">Ganhos</th>
                <th className="py-2 text-right">Perdidos</th>
                <th className="py-2 text-right">Conversão</th>
              </tr>
            </thead>
            <tbody>
              {byBroker.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">Sem dados no período/filtros</td></tr>
              )}
              {byBroker.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2">{b.name}</td>
                  <td className="py-2 text-right">{b.leads}</td>
                  <td className="py-2 text-right text-emerald-600">{b.won}</td>
                  <td className="py-2 text-right text-destructive">{b.lost}</td>
                  <td className="py-2 text-right font-medium">{b.conversao}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, className }: any) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <Icon className={`h-5 w-5 mx-auto mb-1 ${className || 'text-primary'}`} />
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, onExport, children }: any) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport} title="Exportar CSV">
            <Download className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Empty({ msg = 'Sem dados' }: { msg?: string }) {
  return <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">{msg}</div>;
}
