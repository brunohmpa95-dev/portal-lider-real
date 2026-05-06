import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFinanceCategories, useFinanceAccounts, useUpsertTransaction, type FinanceTransaction } from '@/hooks/useFinance';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<FinanceTransaction> | null;
}

const PAYMENT_METHODS = [
  { v: 'pix', l: 'PIX' },
  { v: 'transfer', l: 'Transferência' },
  { v: 'boleto', l: 'Boleto' },
  { v: 'cash', l: 'Dinheiro' },
  { v: 'card', l: 'Cartão' },
  { v: 'other', l: 'Outro' },
];

export default function FinanceTransactionDialog({ open, onOpenChange, initial }: Props) {
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [status, setStatus] = useState<'pending' | 'paid' | 'canceled'>('pending');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const { data: categories = [] } = useFinanceCategories(kind);
  const { data: accounts = [] } = useFinanceAccounts();
  const upsert = useUpsertTransaction();

  useEffect(() => {
    if (open) {
      setKind((initial?.kind as any) || 'expense');
      setStatus((initial?.status as any) || 'pending');
      setDescription(initial?.description || '');
      setAmount(initial?.amount ? String(initial.amount) : '');
      setCategoryId(initial?.category_id || '');
      setAccountId(initial?.account_id || '');
      setDueDate(initial?.due_date || '');
      setPaidDate(initial?.paid_date || '');
      setPaymentMethod(initial?.payment_method || '');
      setNotes(initial?.notes || '');
    }
  }, [open, initial]);

  async function submit() {
    if (!description.trim() || !amount) return;
    await upsert.mutateAsync({
      id: initial?.id,
      kind,
      status,
      description: description.trim(),
      amount: Number(amount),
      category_id: categoryId || null,
      account_id: accountId || null,
      due_date: dueDate || null,
      paid_date: status === 'paid' ? (paidDate || new Date().toISOString().slice(0, 10)) : null,
      payment_method: paymentMethod || null,
      notes: notes || null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Descrição *</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Aluguel sala comercial" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Vencimento</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {status === 'paid' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de pagamento</Label>
                <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
              </div>
              <div>
                <Label>Forma</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((p) => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conta</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={upsert.isPending}>
            {upsert.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
