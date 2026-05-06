import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinanceTransaction {
  id: string;
  kind: 'income' | 'expense';
  status: 'pending' | 'paid' | 'canceled';
  amount: number;
  description: string;
  category_id: string | null;
  account_id: string | null;
  due_date: string | null;
  paid_date: string | null;
  payment_method: string | null;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  kind: 'income' | 'expense';
  parent_id: string | null;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface FinanceAccount {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'digital_wallet' | 'credit_card';
  bank_name: string | null;
  agency: string | null;
  account_number: string | null;
  initial_balance: number;
  is_active: boolean;
  notes: string | null;
}

export interface TransactionFilters {
  kind?: 'income' | 'expense';
  status?: 'pending' | 'paid' | 'canceled';
  category_id?: string;
  account_id?: string;
  from?: string;
  to?: string;
  search?: string;
}

export function useFinanceTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['finance-transactions', filters],
    queryFn: async () => {
      let q = supabase
        .from('finance_transactions' as any)
        .select('*')
        .order('due_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters.kind) q = q.eq('kind', filters.kind);
      if (filters.status) q = q.eq('status', filters.status);
      if (filters.category_id) q = q.eq('category_id', filters.category_id);
      if (filters.account_id) q = q.eq('account_id', filters.account_id);
      if (filters.from) q = q.gte('due_date', filters.from);
      if (filters.to) q = q.lte('due_date', filters.to);
      if (filters.search) q = q.ilike('description', `%${filters.search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as FinanceTransaction[]) || [];
    },
  });
}

export function useFinanceCategories(kind?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['finance-categories', kind],
    queryFn: async () => {
      let q = supabase
        .from('finance_categories' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name');
      if (kind) q = q.eq('kind', kind);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as FinanceCategory[]) || [];
    },
    staleTime: 60_000,
  });
}

export function useFinanceAccounts() {
  return useQuery({
    queryKey: ['finance-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_accounts' as any)
        .select('*')
        .order('name');
      if (error) throw error;
      return (data as unknown as FinanceAccount[]) || [];
    },
    staleTime: 60_000,
  });
}

export function useUpsertTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tx: Partial<FinanceTransaction> & { id?: string }) => {
      const payload: any = { ...tx };
      if (payload.amount !== undefined) payload.amount = Number(payload.amount);
      if (payload.id) {
        const { error } = await supabase
          .from('finance_transactions' as any)
          .update(payload)
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('finance_transactions' as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance-transactions'] });
      qc.invalidateQueries({ queryKey: ['finance-kpis'] });
      qc.invalidateQueries({ queryKey: ['finance-cashflow'] });
      toast.success('Lançamento salvo');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao salvar'),
  });
}

export function useMarkTransactionPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paid_date }: { id: string; paid_date: string }) => {
      const { error } = await supabase
        .from('finance_transactions' as any)
        .update({ status: 'paid', paid_date })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance-transactions'] });
      qc.invalidateQueries({ queryKey: ['finance-kpis'] });
      qc.invalidateQueries({ queryKey: ['finance-cashflow'] });
      toast.success('Marcado como pago');
    },
  });
}

export function useFinanceKPIs(periodDays = 30) {
  return useQuery({
    queryKey: ['finance-kpis', periodDays],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - periodDays);
      const sinceStr = since.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('finance_transactions' as any)
        .select('kind, status, amount, due_date, paid_date')
        .or(`due_date.gte.${sinceStr},paid_date.gte.${sinceStr}`);
      if (error) throw error;

      const rows = (data as any[]) || [];
      const income_paid = rows
        .filter((r) => r.kind === 'income' && r.status === 'paid')
        .reduce((s, r) => s + Number(r.amount), 0);
      const expense_paid = rows
        .filter((r) => r.kind === 'expense' && r.status === 'paid')
        .reduce((s, r) => s + Number(r.amount), 0);
      const income_pending = rows
        .filter((r) => r.kind === 'income' && r.status === 'pending')
        .reduce((s, r) => s + Number(r.amount), 0);
      const expense_pending = rows
        .filter((r) => r.kind === 'expense' && r.status === 'pending')
        .reduce((s, r) => s + Number(r.amount), 0);
      return {
        income_paid,
        expense_paid,
        balance: income_paid - expense_paid,
        income_pending,
        expense_pending,
      };
    },
  });
}

export function useCashflowMonthly(months = 6) {
  return useQuery({
    queryKey: ['finance-cashflow', months],
    queryFn: async () => {
      const since = new Date();
      since.setMonth(since.getMonth() - months);
      const sinceStr = since.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('finance_transactions' as any)
        .select('kind, status, amount, paid_date, due_date')
        .gte('due_date', sinceStr);
      if (error) throw error;

      const map: Record<string, { month: string; income: number; expense: number }> = {};
      (data as any[]).forEach((r) => {
        const ref = r.paid_date || r.due_date;
        if (!ref) return;
        const key = ref.slice(0, 7);
        if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
        if (r.kind === 'income' && r.status === 'paid') map[key].income += Number(r.amount);
        if (r.kind === 'expense' && r.status === 'paid') map[key].expense += Number(r.amount);
      });
      return Object.values(map)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((m) => ({
          ...m,
          label: m.month.split('-').reverse().join('/'),
          balance: m.income - m.expense,
        }));
    },
  });
}
