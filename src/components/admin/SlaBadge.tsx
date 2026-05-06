import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';

interface Props {
  status?: string | null;
  distributedAt?: string | null;
  firstResponseAt?: string | null;
}

function fmtElapsed(ms: number) {
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h${min % 60}min`;
  return `${Math.floor(h / 24)}d`;
}

export function SlaBadge({ status, distributedAt, firstResponseAt }: Props) {
  if (firstResponseAt && distributedAt) {
    const elapsed = new Date(firstResponseAt).getTime() - new Date(distributedAt).getTime();
    return (
      <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Respondido em {fmtElapsed(elapsed)}
      </Badge>
    );
  }
  if (!distributedAt) {
    return (
      <Badge variant="outline" className="gap-1">
        <MinusCircle className="h-3 w-3" />
        Sem distribuição
      </Badge>
    );
  }
  const elapsed = Date.now() - new Date(distributedAt).getTime();
  if (status === 'breached') {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        SLA violado · {fmtElapsed(elapsed)}
      </Badge>
    );
  }
  if (status === 'warning') {
    return (
      <Badge className="gap-1 bg-amber-500/15 text-amber-700 border border-amber-500/40 hover:bg-amber-500/20">
        <Clock className="h-3 w-3" />
        Atenção · {fmtElapsed(elapsed)}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-700">
      <Clock className="h-3 w-3" />
      No prazo · {fmtElapsed(elapsed)}
    </Badge>
  );
}
