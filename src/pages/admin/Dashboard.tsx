import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { startOfDay, endOfDay, formatISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Building2, CalendarDays, TrendingUp, MessageSquare, Briefcase,
  ArrowUpRight, Plus, Shield, ClipboardList, DollarSign, UserCog,
  FileText, AlertTriangle, Loader2, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/lib/auth-types';
import { ROLE_LABELS } from '@/lib/auth-types';
import { useTasks } from '@/hooks/useTasks';
import { useLeadStats, type StatsPeriod } from '@/hooks/useLeadStats';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FUNNEL_COLORS = ['hsl(var(--primary))', '#60a5fa', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#94a3b8'];

interface DashboardStats {
  leads: number;
  leadsMonth: number;
  properties: number;
  visits: number;
  ticketsOpen: number;
  ticketsProgress: number;
  ticketsResolved: number;
  applications: number;
}

function useDailySummary() {
  const todayStart = formatISO(startOfDay(new Date()));
  const todayEnd = formatISO(endOfDay(new Date()));
  const now = new Date().toISOString();

  const { data: newLeads = 0, isLoading: loadingNewLeads } = useQuery({
    queryKey: ['admin-daily-new-leads'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('property_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: overdueFollowups = 0, isLoading: loadingOverdue } = useQuery({
    queryKey: ['admin-daily-overdue-followups'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('property_leads')
        .select('*', { count: 'exact', head: true })
        .lt('next_followup_at', now)
        .not('status', 'in', '("won","lost")');
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: whatsappClicks = 0, isLoading: loadingClicks } = useQuery({
    queryKey: ['admin-daily-whatsapp-clicks'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('whatsapp_clicks')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: activeProperties = 0, isLoading: loadingProperties } = useQuery({
    queryKey: ['admin-active-properties-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      if (error) throw error;
      return count ?? 0;
    },
  });

  return {
    newLeads,
    overdueFollowups,
    whatsappClicks,
    activeProperties,
    isLoading: loadingNewLeads || loadingOverdue || loadingClicks || loadingProperties,
  };
}

interface DailyMetric {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}

function DailySummaryCard({ metrics, isLoading }: { metrics: DailyMetric[]; isLoading: boolean }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted text-primary">
                <metric.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { roles, hasRole } = useAuth();
  const isSuperAdmin = hasRole('superadmin');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<StatsPeriod>(30);
  const { data: overdueTasks = [] } = useTasks({ filter: 'overdue' });
  const { data: todayTasks = [] } = useTasks({ filter: 'today' });
  const { data: leadStats } = useLeadStats(period);
  const dailySummary = useDailySummary();
  const [stats, setStats] = useState<DashboardStats>({
    leads: 0, leadsMonth: 0, properties: 0, visits: 0,
    ticketsOpen: 0, ticketsProgress: 0, ticketsResolved: 0, applications: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<{ name: string; value: number }[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; count: number }[]>([]);
  const [userRoles, setUserRoles] = useState<{ user_id: string; role: AppRole; full_name: string | null }[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [leadsRes, propsRes, visitsRes, recentRes, ticketsRes, appsRes, rolesRes, auditRes] = await Promise.all([
      supabase.from('property_leads').select('id, funnel_stage, source, created_at'),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('visits').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
      supabase.from('property_leads').select('id, name, email, source, funnel_stage, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('ombudsman_tickets').select('id, status'),
      supabase.from('job_applications').select('id', { count: 'exact', head: true }),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('audit_log').select('id, action, resource, result, created_at, user_id').order('created_at', { ascending: false }).limit(10),
    ]);

    const leads = leadsRes.data || [];
    const leadsMonth = leads.filter((l: any) => l.created_at >= monthStart).length;
    const tickets = ticketsRes.data || [];

    setStats({
      leads: leads.length,
      leadsMonth,
      properties: propsRes.count || 0,
      visits: visitsRes.count || 0,
      ticketsOpen: tickets.filter((t: any) => t.status === 'open').length,
      ticketsProgress: tickets.filter((t: any) => t.status === 'in_progress').length,
      ticketsResolved: tickets.filter((t: any) => t.status === 'resolved').length,
      applications: appsRes.count || 0,
    });

    setRecentLeads(recentRes.data || []);

    // Funnel
    const funnelMap: Record<string, number> = {};
    leads.forEach((l: any) => { const s = l.funnel_stage || 'new'; funnelMap[s] = (funnelMap[s] || 0) + 1; });
    const stageLabels: Record<string, string> = { new: 'Novo', contact: 'Contato', visit: 'Visita', proposal: 'Proposta', negotiation: 'Negociação', closed: 'Fechado', lost: 'Perdido' };
    setFunnelData(Object.entries(funnelMap).map(([k, v]) => ({ name: stageLabels[k] || k, value: v })));

    // Source
    const sourceMap: Record<string, number> = {};
    leads.forEach((l: any) => { const s = l.source || 'outro'; sourceMap[s] = (sourceMap[s] || 0) + 1; });
    const srcLabels: Record<string, string> = { website: 'Site', whatsapp: 'WhatsApp', phone: 'Telefone', referral: 'Indicação', social: 'Redes Sociais', portal: 'Portal', walk_in: 'Presencial', other: 'Outro' };
    setSourceData(Object.entries(sourceMap).map(([k, v]) => ({ name: srcLabels[k] || k, count: v })).sort((a, b) => b.count - a.count));

    // User roles + profiles
    const rolesData = rolesRes.data || [];
    if (rolesData.length > 0) {
      const userIds = [...new Set(rolesData.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      setUserRoles(rolesData.map((r: any) => ({ user_id: r.user_id, role: r.role as AppRole, full_name: profileMap.get(r.user_id) || null })));
    }

    setAuditLogs(auditRes.data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total de Leads', value: stats.leads, icon: Users, color: 'text-blue-600' },
    { label: 'Leads do Mês', value: stats.leadsMonth, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Imóveis Ativos', value: stats.properties, icon: Building2, color: 'text-purple-600' },
    { label: 'Visitas Agendadas', value: stats.visits, icon: CalendarDays, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral da operação</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/admin/leads/new"><Plus className="h-4 w-4 mr-1" /> Novo Lead</Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg bg-muted ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CRM — Pendências e funil avançado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Pendências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link to="/admin/tarefas" className="flex justify-between p-2 rounded hover:bg-muted">
              <span className="text-muted-foreground">Tarefas atrasadas</span>
              <Badge variant={overdueTasks.length > 0 ? 'destructive' : 'outline'}>{overdueTasks.length}</Badge>
            </Link>
            <Link to="/admin/tarefas" className="flex justify-between p-2 rounded hover:bg-muted">
              <span className="text-muted-foreground">Tarefas para hoje</span>
              <Badge variant="secondary">{todayTasks.length}</Badge>
            </Link>
            <Link to="/admin/leads" className="flex justify-between p-2 rounded hover:bg-muted">
              <span className="text-muted-foreground">Leads em negociação</span>
              <Badge variant="outline">{leadStats?.byStage['negotiation'] ?? 0}</Badge>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" /> Funil de conversão
            </CardTitle>
            <Tabs value={String(period)} onValueChange={(v) => setPeriod(Number(v) as StatsPeriod)}>
              <TabsList className="h-8">
                <TabsTrigger value="7" className="text-xs h-6">7d</TabsTrigger>
                <TabsTrigger value="30" className="text-xs h-6">30d</TabsTrigger>
                <TabsTrigger value="90" className="text-xs h-6">90d</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-2 rounded border">
                <p className="text-[10px] text-muted-foreground">Conversão</p>
                <p className="text-lg font-bold text-green-600">{leadStats?.conversionRate.toFixed(1) ?? '0.0'}%</p>
              </div>
              <div className="p-2 rounded border">
                <p className="text-[10px] text-muted-foreground">Perda</p>
                <p className="text-lg font-bold text-red-500">{leadStats?.lostRate.toFixed(1) ?? '0.0'}%</p>
              </div>
              <div className="p-2 rounded border">
                <p className="text-[10px] text-muted-foreground">Tempo médio</p>
                <p className="text-lg font-bold">{leadStats?.avgDaysToClose ? `${leadStats.avgDaysToClose.toFixed(0)}d` : '—'}</p>
              </div>
            </div>
            {leadStats && Object.values(leadStats.byStage).some((v) => v > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={Object.entries(leadStats.byStage).map(([k, v]) => ({ name: k, value: v }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Sem dados no período</div>
            )}
            {leadStats && leadStats.topLostReasons.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold mb-1.5">Top motivos de perda</p>
                <ul className="space-y-1">
                  {leadStats.topLostReasons.map((r) => (
                    <li key={r.name} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{r.name}</span>
                      <span className="font-medium">{r.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tickets + Applications summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Ouvidoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Abertos</span><Badge variant="destructive">{stats.ticketsOpen}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Em andamento</span><Badge variant="secondary">{stats.ticketsProgress}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Resolvidos</span><Badge variant="outline">{stats.ticketsResolved}</Badge></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Trabalhe Conosco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.applications}</p>
            <p className="text-sm text-muted-foreground">candidaturas recebidas</p>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Links Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Imóveis', path: '/admin/properties', icon: Building2 },
                { label: 'Leads', path: '/admin/leads', icon: Users },
                { label: 'Clientes', path: '/admin/clientes', icon: UserCog },
                { label: 'Corretores', path: '/admin/corretores', icon: Briefcase },
                { label: 'Contratos', path: '/admin/contratos', icon: FileText },
                { label: 'Chamados', path: '/admin/tickets', icon: MessageSquare },
                { label: 'Financeiro', path: '/admin/financeiro', icon: DollarSign },
                { label: 'Agenda', path: '/admin/agenda', icon: CalendarDays },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="flex items-center gap-1.5 p-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <link.icon className="h-3.5 w-3.5" /> {link.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Leads por Origem</CardTitle></CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Funil de Leads</CardTitle></CardHeader>
          <CardContent>
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={funnelData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {funnelData.map((_, i) => (<Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Leads Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/leads">Ver todos <ArrowUpRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead: any) => (
                <Link key={lead.id} to={`/admin/leads/${lead.id}`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">{lead.source || 'site'}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum lead registrado</p>
          )}
        </CardContent>
      </Card>

      {/* Users & Roles (admin/superadmin) */}
      {(hasRole('administrativo') || isSuperAdmin) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Usuários e Perfis
            </CardTitle>
            {isSuperAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/team">Gerenciar <ArrowUpRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {userRoles.length > 0 ? (
              <div className="space-y-2">
                {userRoles.map((ur, i) => (
                  <div key={`${ur.user_id}-${ur.role}-${i}`} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{ur.full_name || ur.user_id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground truncate">{ur.user_id}</p>
                    </div>
                    <Badge>{ROLE_LABELS[ur.role] || ur.role}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum usuário com perfil atribuído</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Log (admin/superadmin) */}
      {(hasRole('administrativo') || isSuperAdmin) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Auditoria — Ações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs.length > 0 ? (
              <div className="space-y-2">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">{log.action}</span>
                      {log.resource && <span className="text-muted-foreground ml-2">em {log.resource}</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={log.result === 'success' ? 'outline' : 'destructive'} className="text-xs">
                        {log.result || '—'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum registro de auditoria</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
