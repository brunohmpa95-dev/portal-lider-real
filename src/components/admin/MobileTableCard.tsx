import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileTableCardProps {
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * Wrapper para versão mobile (< md) de linhas de tabelas administrativas.
 * Use em conjunto com `<div className="hidden md:block"><Table /></div>` e
 * `<div className="md:hidden space-y-2">{rows.map(r => <MobileTableCard ... />)}</div>`.
 */
export function MobileTableCard({ onClick, className, children }: MobileTableCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'rounded-lg border border-border bg-card p-3 text-sm shadow-sm',
        onClick && 'cursor-pointer active:bg-muted/50 transition-colors',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface MobileTableRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MobileTableRow({ label, value, className }: MobileTableRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 py-1', className)}>
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right truncate min-w-0">{value}</span>
    </div>
  );
}

export default MobileTableCard;
