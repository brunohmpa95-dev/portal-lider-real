import {
  LEAD_TEMPERATURE_OPTIONS,
  LEAD_CHANNEL_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_FUNNEL_STAGES,
  LEAD_PRIORITY_OPTIONS,
  type AdminLead,
} from '@/types/admin';

const findLabel = (list: { value: string; label: string }[], v?: string | null) =>
  list.find((o) => o.value === v)?.label ?? v ?? '—';

export const temperatureLabel = (t?: string | null) => findLabel(LEAD_TEMPERATURE_OPTIONS, t);
export const channelLabel = (c?: string | null) => findLabel(LEAD_CHANNEL_OPTIONS, c);
export const sourceLabel = (s?: string | null) => findLabel(LEAD_SOURCE_OPTIONS, s);
export const funnelStageLabel = (s?: string | null) => findLabel(LEAD_FUNNEL_STAGES, s);
export const priorityLabel = (p?: string | null) => findLabel(LEAD_PRIORITY_OPTIONS, p);

/** Classes Tailwind semânticas para badge de temperatura. */
export function temperatureColor(t?: string | null): string {
  switch (t) {
    case 'hot': return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'warm': return 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30';
    case 'cold':
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function funnelStageColor(stage?: string | null): string {
  switch (stage) {
    case 'new': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
    case 'contact': return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30';
    case 'visit': return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30';
    case 'proposal': return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
    case 'negotiation': return 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30';
    case 'closed': return 'bg-primary/15 text-primary border-primary/30';
    case 'lost': return 'bg-destructive/15 text-destructive border-destructive/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

/** Devolve o melhor contato disponível: WhatsApp tem prioridade. */
export function formatLeadContact(lead: Pick<AdminLead, 'whatsapp' | 'phone'>): {
  preferred: string | null;
  type: 'whatsapp' | 'phone' | null;
} {
  if (lead.whatsapp?.trim()) return { preferred: lead.whatsapp, type: 'whatsapp' };
  if (lead.phone?.trim()) return { preferred: lead.phone, type: 'phone' };
  return { preferred: null, type: null };
}

/** Lead sem interação há mais de N horas (default 24h) e ainda não fechado/perdido. */
export function isLeadStale(lead: Pick<AdminLead, 'last_interaction_at' | 'created_at' | 'funnel_stage'>, hours = 24): boolean {
  if (lead.funnel_stage === 'closed' || lead.funnel_stage === 'lost') return false;
  const ref = lead.last_interaction_at ?? lead.created_at;
  if (!ref) return false;
  const diffMs = Date.now() - new Date(ref).getTime();
  return diffMs > hours * 3_600_000;
}
