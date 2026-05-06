import { useState } from 'react';
import { DollarSign, Loader2, Plus, Edit2, CheckCircle2, Download, TrendingUp, TrendingDown } from 'lucide-react';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import KPICard from '@/components/shared/KPICard';
import EmptyState from '@/components/shared/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  useFinanceTransactions,
  useFinanceCategories,
  useFinanceAccounts,
  useFinanceKPIs,
  useCashflowMonthly,
  useMarkTransactionPaid,
  type FinanceTransaction,
} from '@/hooks/useFinance';
import FinanceTransactionDialog from '@/components/admin/FinanceTransactionDialog';
import { MobileTableCard, MobileTableRow } from '@/components/admin/MobileTableCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface CommissionRow {
  id: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  broker_id: string;
  brokers?: { profiles?: { full_name: string | null } | null } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  paid: { label: 'Pago', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminFinancial() {
  const [tab, setTab] = useState('summary');
  const [period, setPeriod] = useState<7 | 30 | 90 | 365>(30);
  const [filterKind, setFilterKind] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'canceled'>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FinanceTransaction> | null>(null);

  const { data: kpi } = useFinanceKPIs(period);
  const { data: cashflow = [] } = useCashflowMonthly(6);
  const { data: transactions = [], isLoading: txLoading } = useFinanceTransactions({
    kind: filterKind === 'all' ? undefined : filterKind,
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: search || undefined,
  });
  const { data: categories = [] } = useFinanceCategories();
  const { data: accounts = [] } = useFinanceAccounts();
  const markPaid = useMarkTransactionPaid();

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name || '—';
  const accName = (id: string | null) => accounts.find((a) => a.id === id)?.name || '—';

  function openNew(kind?: 'income' | 'expense') {
    setEditing(kind ? { kind } : null);
    setDialogOpen(true);
  }
  function openEdit(tx: FinanceTransaction) {
    setEditing(tx);
    setDialogOpen(true);
  }

  async function exportCsv(report: 'revenue_period' | 'expenses_period' | 'commissions_by_broker') {
    try {
      const since = new Date();
      since.setDate(since.getDate() - period);
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          report,
          format: 'csv',
          filters: { from: since.toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) },
        },
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

  return (
    <div>
      <InternalPageHeader title="Financeiro" subtitle="Lançamentos, contas, categorias e comissões" />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto -mx-4 px-4 mb-4">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="summary" className="text-xs sm:text-sm">Resumo</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">Lançamentos</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categorias</TabsTrigger>
            <TabsTrigger value="accounts" className="text-xs sm:text-sm">Contas</TabsTrigger>
            <TabsTrigger value="commissions" className="text-xs sm:text-sm">Comissões</TabsTrigger>
          </TabsList>
        </div>

        {/* RESUMO */}
        <TabsContent value="summary" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Select value={String(period)} onValueChange={(v) => setPeriod(Number(v) as any)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportCsv('revenue_period')}>
                <Download className="h-4 w-4 mr-1" /> Receitas
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportCsv('expenses_period')}>
                <Download className="h-4 w-4 mr-1" /> Despesas
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard title="Receita" value={fmtBRL(kpi?.income_paid || 0)} icon={TrendingUp} />
            <KPICard title="Despesa" value={fmtBRL(kpi?.expense_paid || 0)} icon={TrendingDown} />
            <KPICard title="Saldo" value={fmtBRL(kpi?.balance || 0)} icon={DollarSign} />
            <KPICard title="A receber" value={fmtBRL(kpi?.income_pending || 0)} icon={DollarSign} />
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Fluxo de caixa (6 meses)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={cashflow} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmtBRL(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="income" name="Receita" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" name="Despesa" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" name="Saldo" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LANÇAMENTOS */}
        <TabsContent value="transactions" className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Buscar descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
            <Select value={filterKind} onValueChange={(v) => setFilterKind(v as any)}>
              <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tipo: todos</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 sm:ml-auto">
              <Button onClick={() => openNew('income')} variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-1" /> Receita
              </Button>
              <Button onClick={() => openNew('expense')} size="sm" className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-1" /> Despesa
              </Button>
            </div>
          </div>

          {txLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : transactions.length === 0 ? (
            <EmptyState icon={DollarSign} title="Nenhum lançamento" description="Crie um lançamento para começar." />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Descrição</th>
                        <th className="text-left px-3 py-2 font-medium">Categoria</th>
                        <th className="text-left px-3 py-2 font-medium">Conta</th>
                        <th className="text-left px-3 py-2 font-medium">Vencimento</th>
                        <th className="text-right px-3 py-2 font-medium">Valor</th>
                        <th className="text-center px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 w-24" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/20">
                          <td className="px-3 py-2">
                            <div className="font-medium">{tx.description}</div>
                            <div className="text-xs text-muted-foreground capitalize">{tx.kind === 'income' ? 'Receita' : 'Despesa'}</div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{catName(tx.category_id)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{accName(tx.account_id)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{tx.due_date ? new Date(tx.due_date).toLocaleDateString('pt-BR') : '—'}</td>
                          <td className={`px-3 py-2 text-right font-mono font-semibold ${tx.kind === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.kind === 'income' ? '+' : '-'}{fmtBRL(Number(tx.amount))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[tx.status]?.color || ''}`}>
                              {STATUS_LABELS[tx.status]?.label || tx.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              {tx.status === 'pending' && (
                                <Button size="icon" variant="ghost" className="h-8 w-8" title="Marcar pago"
                                  onClick={() => markPaid.mutate({ id: tx.id, paid_date: new Date().toISOString().slice(0, 10) })}>
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(tx)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {transactions.map((tx) => (
                  <MobileTableCard key={tx.id} onClick={() => openEdit(tx)}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{catName(tx.category_id)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_LABELS[tx.status]?.color || ''}`}>
                        {STATUS_LABELS[tx.status]?.label || tx.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {tx.due_date ? new Date(tx.due_date).toLocaleDateString('pt-BR') : 'Sem vencimento'}
                      </span>
                      <span className={`font-mono font-semibold ${tx.kind === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.kind === 'income' ? '+' : '-'}{fmtBRL(Number(tx.amount))}
                      </span>
                    </div>
                    {tx.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 min-h-11"
                        onClick={(e) => {
                          e.stopPropagation();
                          markPaid.mutate({ id: tx.id, paid_date: new Date().toISOString().slice(0, 10) });
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Marcar pago
                      </Button>
                    )}
                  </MobileTableCard>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* CATEGORIAS */}
        <TabsContent value="categories">
          <Card>
            <CardHeader><CardTitle className="text-base">Categorias</CardTitle></CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <EmptyState icon={DollarSign} title="Sem categorias" description="As categorias seedadas aparecerão aqui." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 p-2 border border-border rounded-md">
                      <span className="h-3 w-3 rounded-full" style={{ background: c.color || 'hsl(var(--primary))' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.kind === 'income' ? 'Receita' : 'Despesa'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTAS */}
        <TabsContent value="accounts">
          <Card>
            <CardHeader><CardTitle className="text-base">Contas financeiras</CardTitle></CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <EmptyState icon={DollarSign} title="Sem contas" description="Cadastre contas pelo banco de dados (UI completa em breve)." />
              ) : (
                <div className="space-y-2">
                  {accounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.bank_name || a.type}</p>
                      </div>
                      <Badge variant={a.is_active ? 'default' : 'secondary'}>
                        {a.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMISSÕES */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Comissões de corretores</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportCsv('commissions_by_broker')}>
                <Download className="h-4 w-4 mr-1" /> Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <CommissionsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FinanceTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} />
    </div>
  );
}

function CommissionsList() {
  const [rows, setRows] = useState<CommissionRow[] | null>(null);

  if (rows === null) {
    supabase
      .from('commissions')
      .select('id, amount, status, due_date, paid_at, broker_id, brokers(profiles(full_name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as any[]) || []));
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (rows.length === 0) {
    return <EmptyState icon={DollarSign} title="Sem comissões" description="As comissões aparecem aqui após fechamentos." />;
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Corretor</th>
              <th className="text-right px-3 py-2 font-medium">Valor</th>
              <th className="text-left px-3 py-2 font-medium">Vencimento</th>
              <th className="text-center px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2">{c.brokers?.profiles?.full_name || '—'}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtBRL(Number(c.amount))}</td>
                <td className="px-3 py-2 text-muted-foreground">{c.due_date ? new Date(c.due_date).toLocaleDateString('pt-BR') : '—'}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[c.status]?.color || ''}`}>
                    {STATUS_LABELS[c.status]?.label || c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-2">
        {rows.map((c) => (
          <MobileTableCard key={c.id}>
            <MobileTableRow label="Corretor" value={c.brokers?.profiles?.full_name || '—'} />
            <MobileTableRow label="Valor" value={fmtBRL(Number(c.amount))} />
            <MobileTableRow label="Vencimento" value={c.due_date ? new Date(c.due_date).toLocaleDateString('pt-BR') : '—'} />
            <MobileTableRow
              label="Status"
              value={<span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[c.status]?.color || ''}`}>{STATUS_LABELS[c.status]?.label || c.status}</span>}
            />
          </MobileTableCard>
        ))}
      </div>
    </>
  );
}
