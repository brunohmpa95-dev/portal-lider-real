import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Building2, CalendarDays, TrendingUp,
  ArrowUpRight, ArrowDownRight, Plus, Eye,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

interface KPI {
  label: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  color: string;
}

const FUNNEL_COLORS = ['hsl(var(--primary))', '#60a5fa', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#94a3b8'];

export default function Dashboard() {
  const { roles } = useAuth();
  const [stats, setStats] = useState({ leads: 0, leadsMonth: 0, properties: 0, visits: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<{ name: string; value: number }[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [leadsRes, propsRes, visitsRes, recentRes] = await Promise.all([
      supabase.from('property_leads').select('id, funnel_stage, source, created_at'),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('visits' as any).select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
      supabase.from('property_leads').select('id, name, email, source, funnel_stage, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const leads = leadsRes.data || [];
    const leadsMonth = leads.filter((l: any) => l.created_at >= monthStart).length;

    setStats({
      leads: leads.length,
      leadsMonth,
      properties: propsRes.count || 0,
      visits: visitsRes.count || 0,
    });

    setRecentLeads(recentRes.data || []);

    // Funnel aggregation
    const funnelMap: Record<string, number> = {};
    leads.forEach((l: any) => {
      const stage = l.funnel_stage || 'new';
      funnelMap[stage] = (funnelMap[stage] || 0) + 1;
    });
    const stageLabels: Record<string, string> = {
      new: 'Novo', contact: 'Contato', visit: 'Visita', proposal: 'Proposta',
      negotiation: 'Negociação', closed: 'Fechado', lost: 'Perdido',
    };
    setFunnelData(
      Object.entries(funnelMap).map(([k, v]) => ({ name: stageLabels[k] || k, value: v }))
    );

    // Source aggregation
    const sourceMap: Record<string, number> = {};
    leads.forEach((l: any) => {
      const src = l.source || 'outro';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const srcLabels: Record<string, string> = {
      website: 'Site', whatsapp: 'WhatsApp', phone: 'Telefone', referral: 'Indicação',
      social: 'Redes Sociais', portal: 'Portal', walk_in: 'Presencial', other: 'Outro',
    };
    setSourceData(
      Object.entries(sourceMap)
        .map(([k, v]) => ({ name: srcLabels[k] || k, count: v }))
        .sort((a, b) => b.count - a.count)
    );
  }

  const kpis: KPI[] = [
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads por Origem</CardTitle>
          </CardHeader>
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
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Funil de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {funnelData.map((_, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Leads Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/leads">
              Ver todos <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead: any) => (
                <Link
                  key={lead.id}
                  to={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {lead.source || 'site'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum lead registrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
