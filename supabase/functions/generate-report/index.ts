import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Filters = {
  from?: string;
  to?: string;
  broker_id?: string;
  source?: string;
  category_id?: string;
};

const REPORTS = [
  'leads_by_source',
  'leads_by_broker',
  'funnel_conversion',
  'top_offered',
  'top_converting',
  'channel_performance',
  'revenue_period',
  'expenses_period',
  'commissions_by_broker',
] as const;

type ReportKey = typeof REPORTS[number];

function csvEscape(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toCSV(rows: any[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return lines.join('\n');
}

async function runReport(supabase: any, key: ReportKey, f: Filters): Promise<any[]> {
  const from = f.from || '1970-01-01';
  const to = f.to || new Date().toISOString().slice(0, 10);

  switch (key) {
    case 'leads_by_source': {
      const { data, error } = await supabase
        .from('property_leads')
        .select('source')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59');
      if (error) throw error;
      const map: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const k = r.source || 'unknown';
        map[k] = (map[k] || 0) + 1;
      });
      return Object.entries(map).map(([source, total]) => ({ source, total }));
    }

    case 'leads_by_broker': {
      const { data, error } = await supabase
        .from('property_leads')
        .select('assigned_to')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59');
      if (error) throw error;
      const map: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const k = r.assigned_to || 'unassigned';
        map[k] = (map[k] || 0) + 1;
      });
      // resolve names
      const ids = Object.keys(map).filter((id) => id !== 'unassigned');
      const { data: profiles } = ids.length
        ? await supabase.from('profiles').select('user_id, full_name').in('user_id', ids)
        : { data: [] };
      const nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      return Object.entries(map).map(([id, total]) => ({
        broker_id: id,
        broker_name: id === 'unassigned' ? 'Sem atribuição' : nameMap.get(id) || id,
        total,
      }));
    }

    case 'funnel_conversion': {
      const { data, error } = await supabase
        .from('property_leads')
        .select('funnel_stage')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59');
      if (error) throw error;
      const stages = ['new', 'contact', 'visit', 'proposal', 'negotiation', 'closed', 'lost'];
      const labels: Record<string, string> = {
        new: 'Novo',
        contact: 'Contato',
        visit: 'Visita',
        proposal: 'Proposta',
        negotiation: 'Negociação',
        closed: 'Fechado',
        lost: 'Perdido',
      };
      const map: Record<string, number> = {};
      stages.forEach((s) => (map[s] = 0));
      (data || []).forEach((r: any) => {
        const k = r.funnel_stage || 'new';
        if (map[k] !== undefined) map[k]++;
      });
      const total = (data || []).length;
      return stages.map((s) => ({
        stage: labels[s],
        count: map[s],
        pct: total > 0 ? +((map[s] / total) * 100).toFixed(1) : 0,
      }));
    }

    case 'top_offered': {
      const { data, error } = await supabase
        .from('property_leads')
        .select('property_id, properties(title, code)')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59')
        .not('property_id', 'is', null);
      if (error) throw error;
      const map: Record<string, { code: string; title: string; count: number }> = {};
      (data || []).forEach((r: any) => {
        const id = r.property_id;
        if (!map[id]) {
          map[id] = {
            code: r.properties?.code || '—',
            title: r.properties?.title || '—',
            count: 0,
          };
        }
        map[id].count++;
      });
      return Object.values(map)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    }

    case 'top_converting': {
      const { data, error } = await supabase
        .from('property_leads')
        .select('property_id, funnel_stage, properties(title, code)')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59')
        .not('property_id', 'is', null);
      if (error) throw error;
      const map: Record<string, { code: string; title: string; total: number; closed: number }> = {};
      (data || []).forEach((r: any) => {
        const id = r.property_id;
        if (!map[id]) {
          map[id] = {
            code: r.properties?.code || '—',
            title: r.properties?.title || '—',
            total: 0,
            closed: 0,
          };
        }
        map[id].total++;
        if (r.funnel_stage === 'closed') map[id].closed++;
      });
      return Object.values(map)
        .filter((m) => m.total >= 2)
        .map((m) => ({
          ...m,
          conversion_pct: +((m.closed / m.total) * 100).toFixed(1),
        }))
        .sort((a, b) => b.conversion_pct - a.conversion_pct)
        .slice(0, 20);
    }

    case 'channel_performance': {
      const { data, error } = await supabase
        .from('property_leads')
        .select('source, funnel_stage')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59');
      if (error) throw error;
      const map: Record<string, { total: number; closed: number; lost: number }> = {};
      (data || []).forEach((r: any) => {
        const k = r.source || 'unknown';
        if (!map[k]) map[k] = { total: 0, closed: 0, lost: 0 };
        map[k].total++;
        if (r.funnel_stage === 'closed') map[k].closed++;
        if (r.funnel_stage === 'lost') map[k].lost++;
      });
      return Object.entries(map).map(([source, m]) => ({
        source,
        total: m.total,
        closed: m.closed,
        lost: m.lost,
        conversion_pct: m.total > 0 ? +((m.closed / m.total) * 100).toFixed(1) : 0,
      }));
    }

    case 'revenue_period': {
      const { data, error } = await supabase
        .from('finance_transactions')
        .select('amount, paid_date, due_date, category_id, finance_categories(name)')
        .eq('kind', 'income')
        .eq('status', 'paid')
        .gte('paid_date', from)
        .lte('paid_date', to);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const k = r.finance_categories?.name || 'Sem categoria';
        map[k] = (map[k] || 0) + Number(r.amount);
      });
      return Object.entries(map).map(([category, total]) => ({
        category,
        total: +total.toFixed(2),
      }));
    }

    case 'expenses_period': {
      const { data, error } = await supabase
        .from('finance_transactions')
        .select('amount, paid_date, category_id, finance_categories(name)')
        .eq('kind', 'expense')
        .eq('status', 'paid')
        .gte('paid_date', from)
        .lte('paid_date', to);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const k = r.finance_categories?.name || 'Sem categoria';
        map[k] = (map[k] || 0) + Number(r.amount);
      });
      return Object.entries(map).map(([category, total]) => ({
        category,
        total: +total.toFixed(2),
      }));
    }

    case 'commissions_by_broker': {
      const { data, error } = await supabase
        .from('commissions')
        .select('amount, status, broker_id, brokers(profiles(full_name))')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59');
      if (error) throw error;
      const map: Record<string, { name: string; pending: number; paid: number; count: number }> = {};
      (data || []).forEach((r: any) => {
        const id = r.broker_id || 'unknown';
        if (!map[id]) {
          map[id] = {
            name: r.brokers?.profiles?.full_name || '—',
            pending: 0,
            paid: 0,
            count: 0,
          };
        }
        map[id].count++;
        if (r.status === 'paid') map[id].paid += Number(r.amount);
        else if (r.status === 'pending') map[id].pending += Number(r.amount);
      });
      return Object.values(map).sort((a, b) => b.paid + b.pending - (a.paid + a.pending));
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const report = body.report as ReportKey;
    const filters = (body.filters || {}) as Filters;
    const format = (body.format || 'json') as 'json' | 'csv';

    if (!REPORTS.includes(report)) {
      return new Response(JSON.stringify({ error: 'Relatório inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // permission check
    const requiresFinance = ['revenue_period', 'expenses_period', 'commissions_by_broker'].includes(report);
    const code = requiresFinance ? 'reports.financial' : 'reports.read';
    const { data: hasPerm } = await supabase.rpc('has_permission', {
      _user_id: user.id,
      _code: code,
    });
    if (!hasPerm) {
      return new Response(JSON.stringify({ error: 'Sem permissão para este relatório' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rows = await runReport(supabase, report, filters);

    // audit export
    if (format !== 'json') {
      await supabase.rpc('log_audit', {
        _action: 'reports.export',
        _target_type: 'report',
        _target_id: report,
        _metadata: { filters, format, count: rows.length },
      });
    }

    if (format === 'csv') {
      const csv = toCSV(rows);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${report}_${Date.now()}.csv"`,
        },
      });
    }

    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('generate-report error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erro' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
