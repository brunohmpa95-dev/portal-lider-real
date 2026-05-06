import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import KPICard from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Users, Building2, DollarSign, Target, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { useFinanceKPIs, useCashflowMonthly } from '@/hooks/useFinance';

const COLORS = ['hsl(var(--primary))', '#60a5fa', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];

type Period = 7 | 30 | 90 | 365;

export default function AdminGestao() {
  const [period, setPeriod] = useState<Period>(30);
  const [loading, setLoading] = useState(true);
  const [leadStats, setLeadStats] = useState({ total: 0, won: 0, lost: 0, conversion: 0 });
  const [topBrokers, setTopBrokers] = useState<{ name: string; leads: number; closed: number }[]>([]);
  const [topNeighborhoods, setTopNeighborhoods] = useState<{ name: string; count: number }[]>([]);
  const [funnelData, setFunnelData] = useState<{ name: string; value: number }[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);

  const { data: finKpi } = useFinanceKPIs(period);
  const { data: cashflow = [] } = useCashflowMonthly(6);

  useEffect(() => { load(); }, [period]);

  async function load() {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - period);
    const sinceStr = since.toISOString();

    const [leadsRes, propsRes] = await Promise.all([
      supabase
        .from('property_leads')
        .select('id, funnel_stage, source, assigned_to, created_at')
        .gte('created_at', sinceStr),
      supabase
        .from('properties')
        .select('id, neighborhood, status, archived_at'),
    ]);

    const leads = leadsRes.data || [];
    const props = propsRes.data || [];

    const won = leads.filter((l) => l.funnel_stage === 'closed').length;
    const lost = leads.filter((l) => l.funnel_stage === 'lost').length;
    setLeadStats({
      total: leads.length,
      won,
      lost,
      conversion: leads.length > 0 ? +(((won) / leads.length) * 100).toFixed(1) : 0,
    });

    const stageLabels: Record<string, string> = {
      new: 'Novo', contact: 'Contato', visit: 'Visita', proposal: 'Proposta',
      negotiation: 'Negociação', closed: 'Fechado', lost: 'Perdido',
    };
    const stageMap: Record<string, number> = {};
    leads.forEach((l) => { const k = l.funnel_stage || 'new'; stageMap[k] = (stageMap[k] || 0) + 1; });
    setFunnelData(Object.entries(stageMap).map(([k, v]) => ({ name: stageLabels[k] || k, value: v })));

    const sourceLabels: Record<string, string> = {
      website: 'Site', whatsapp: 'WhatsApp', phone: 'Telefone', referral: 'Indicação',
      social: 'Redes', portal: 'Portal', walk_in: 'Presencial', other: 'Outro',
    };
    const srcMap: Record<string, number> = {};
    leads.forEach((l) => { const k = l.source || 'other'; srcMap[k] = (srcMap[k] || 0) + 1; });
    setSourceData(Object.entries(srcMap).map(([k, v]) => ({ name: sourceLabels[k] || k, value: v })));

    // Top corretores
    const brokerMap: Record<string, { leads: number; closed: number }> = {};
    leads.forEach((l) => {
      if (!l.assigned_to) return;
      if (!brokerMap[l.assigned_to]) brokerMap[l.assigned_to] = { leads: 0, closed: 0 };
      brokerMap[l.assigned_to].leads++;
      if (l.funnel_stage === 'closed') brokerMap[l.assigned_to].closed++;
    });
    const brokerIds = Object.keys(brokerMap);
    const profilesRes = brokerIds.length
      ? await supabase.from('profiles').select('user_id, full_name').in('user_id', brokerIds)
      : { data: [] };
    const nameMap = new Map((profilesRes.data || []).map((p: any) => [p.user_id, p.full_name]));
    setTopBrokers(
      brokerIds
        .map((id) => ({ name: nameMap.get(id) || '—', ...brokerMap[id] }))
        .sort((a, b) => b.closed - a.closed || b.leads - a.leads)
        .slice(0, 8),
    );

    // Top bairros (imóveis ativos)
    const nMap: Record<string, number> = {};
    props.filter((p) => p.status === 'published' && !p.archived_at).forEach((p) => {
      const k = p.neighborhood || 'Sem bairro';
      nMap[k] = (nMap[k] || 0) + 1;
    });
    setTopNeighborhoods(
      Object.entries(nMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    );

    setLoading(false);
  }

  return (
    <div>
      <InternalPageHeader title="Dashboard Gerencial" subtitle="Visão consolidada de operação, comercial e financeiro" />

      <div className="mb-4">
        <Tabs value={String(period)} onValueChange={(v) => setPeriod(Number(v) as Period)}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="7">7d</TabsTrigger>
            <TabsTrigger value="30">30d</TabsTrigger>
            <TabsTrigger value="90">90d</TabsTrigger>
            <TabsTrigger value="365">1 ano</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <KPICard title="Leads" value={leadStats.total} icon={Users} />
            <KPICard title="Fechados" value={leadStats.won} icon={Award} />
            <KPICard title="Conversão" value={`${leadStats.conversion}%`} icon={Target} />
            <KPICard title="Perdidos" value={leadStats.lost} icon={TrendingUp} />
            <KPICard title="Receita" value={`R$ ${(finKpi?.income_paid || 0).toLocaleString('pt-BR')}`} icon={DollarSign} />
            <KPICard title="Saldo" value={`R$ ${(finKpi?.balance || 0).toLocaleString('pt-BR')}`} icon={DollarSign} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Funil de leads</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={funnelData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Origem dos leads</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={(e) => e.name}>
                      {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Fluxo de caixa (6 meses)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={cashflow} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="income" name="Receita" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" name="Despesa" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="balance" name="Saldo" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Top bairros (imóveis ativos)</CardTitle></CardHeader>
              <CardContent>
                {topNeighborhoods.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Sem dados.</p>
                ) : (
                  <div className="space-y-2">
                    {topNeighborhoods.map((n) => (
                      <div key={n.name} className="flex items-center justify-between text-sm">
                        <span className="truncate">{n.name}</span>
                        <span className="font-semibold">{n.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4" /> Top corretores no período</CardTitle></CardHeader>
            <CardContent>
              {topBrokers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Sem leads atribuídos no período.</p>
              ) : (
                <div className="space-y-2">
                  {topBrokers.map((b, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/30">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.leads} leads · {b.closed} fechados</p>
                      </div>
                      <div className="text-sm font-semibold text-primary shrink-0">
                        {b.leads > 0 ? `${((b.closed / b.leads) * 100).toFixed(0)}%` : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
