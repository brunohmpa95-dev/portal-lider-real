import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Building2, TrendingUp, CalendarDays, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', '#60a5fa', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];

async function exportReport(report: string) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { report, format: 'csv', filters: {} },
    });
    if (error) throw error;
    const blob = new Blob([data as string], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportado');
  } catch (e: any) {
    toast.error(e.message || 'Erro ao exportar');
  }
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [leadsBySource, setLeadsBySource] = useState<any[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<any[]>([]);
  const [propertiesByType, setPropertiesByType] = useState<any[]>([]);
  const [leadsOverTime, setLeadsOverTime] = useState<any[]>([]);
  const [totals, setTotals] = useState({ leads: 0, properties: 0, visits: 0, converted: 0 });

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    setLoading(true);
    const [leadsRes, propsRes, visitsRes] = await Promise.all([
      supabase.from('property_leads').select('id, source, funnel_stage, created_at'),
      supabase.from('properties').select('id, type, purpose, status'),
      supabase.from('visits' as any).select('id, status'),
    ]);

    const leads = leadsRes.data || [];
    const props = propsRes.data || [];
    const visits = (visitsRes as any).data || [];

    setTotals({
      leads: leads.length,
      properties: props.filter((p: any) => p.status === 'published').length,
      visits: visits.filter((v: any) => v.status === 'completed').length,
      converted: leads.filter((l: any) => l.funnel_stage === 'closed').length,
    });

    // Leads by source
    const srcMap: Record<string, number> = {};
    const srcLabels: Record<string, string> = {
      website: 'Site', whatsapp: 'WhatsApp', phone: 'Telefone', referral: 'Indicação',
      social: 'Redes', portal: 'Portal', walk_in: 'Presencial', other: 'Outro',
    };
    leads.forEach((l: any) => { const s = l.source || 'other'; srcMap[s] = (srcMap[s] || 0) + 1; });
    setLeadsBySource(Object.entries(srcMap).map(([k, v]) => ({ name: srcLabels[k] || k, value: v })));

    // Leads by stage
    const stageMap: Record<string, number> = {};
    const stageLabels: Record<string, string> = {
      new: 'Novo', contact: 'Contato', visit: 'Visita', proposal: 'Proposta',
      negotiation: 'Negociação', closed: 'Fechado', lost: 'Perdido',
    };
    leads.forEach((l: any) => { const s = l.funnel_stage || 'new'; stageMap[s] = (stageMap[s] || 0) + 1; });
    setLeadsByStage(Object.entries(stageMap).map(([k, v]) => ({ name: stageLabels[k] || k, value: v })));

    // Properties by type
    const typeMap: Record<string, number> = {};
    const typeLabels: Record<string, string> = {
      casa: 'Casa', apartamento: 'Apto', terreno: 'Terreno', comercial: 'Comercial',
      kitnet: 'Kitnet', chacara: 'Chácara',
    };
    props.forEach((p: any) => { typeMap[p.type] = (typeMap[p.type] || 0) + 1; });
    setPropertiesByType(Object.entries(typeMap).map(([k, v]) => ({ name: typeLabels[k] || k, count: v })));

    // Leads over time (last 6 months)
    const monthMap: Record<string, number> = {};
    leads.forEach((l: any) => {
      const d = new Date(l.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    setLeadsOverTime(
      Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([k, v]) => ({ month: k.split('-')[1] + '/' + k.split('-')[0].slice(2), leads: v }))
    );

    setLoading(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const conversionRate = totals.leads > 0 ? ((totals.converted / totals.leads) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold">Relatórios</h1>
        <Button variant="outline" size="sm" onClick={() => exportReport('channel_performance')} className="min-h-11">
          <Download className="h-4 w-4 mr-1" /> Performance por canal
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold">{totals.leads}</p>
            <p className="text-xs text-muted-foreground">Total de Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <p className="text-2xl font-bold">{totals.properties}</p>
            <p className="text-xs text-muted-foreground">Imóveis Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-5 w-5 mx-auto text-orange-600 mb-1" />
            <p className="text-2xl font-bold">{totals.visits}</p>
            <p className="text-xs text-muted-foreground">Visitas Realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Leads por Origem</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => exportReport('leads_by_source')} title="Exportar CSV"><Download className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            {leadsBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={leadsBySource} cx="50%" cy="50%" outerRadius="75%" dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {leadsBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Funil de Vendas</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => exportReport('funnel_conversion')}><Download className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            {leadsByStage.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leadsByStage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Imóveis por Tipo</CardTitle></CardHeader>
          <CardContent>
            {propertiesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={propertiesByType}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Evolução de Leads</CardTitle></CardHeader>
          <CardContent>
            {leadsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={leadsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
