import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ativo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',

  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  aberto: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',

  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  vencido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',

  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  novo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',

  inactive: 'bg-muted text-muted-foreground',
  inativo: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  ativo: 'Ativo',
  paid: 'Pago',
  pago: 'Pago',
  completed: 'Concluído',
  concluido: 'Concluído',
  pending: 'Pendente',
  pendente: 'Pendente',
  open: 'Aberto',
  aberto: 'Aberto',
  scheduled: 'Agendado',
  overdue: 'Vencido',
  vencido: 'Vencido',
  cancelled: 'Cancelado',
  cancelado: 'Cancelado',
  rejected: 'Rejeitado',
  new: 'Novo',
  novo: 'Novo',
  in_progress: 'Em andamento',
  inactive: 'Inativo',
  inativo: 'Inativo',
  draft: 'Rascunho',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const style = STATUS_STYLES[key] || 'bg-muted text-muted-foreground';
  const text = label || STATUS_LABELS[key] || status;

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', style, className)}>
      {text}
    </span>
  );
}
