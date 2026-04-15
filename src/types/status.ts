// Centralized status constants for the entire system

export const LEAD_STATUS = {
  new: 'Novo',
  contact: 'Contato',
  visit: 'Visita',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed: 'Fechado',
  lost: 'Perdido',
} as const;

export const VISIT_STATUS = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
  no_show: 'Não compareceu',
} as const;

export const PROPOSAL_STATUS = {
  pending: 'Pendente',
  accepted: 'Aceita',
  rejected: 'Recusada',
  expired: 'Expirada',
} as const;

export const CONTRACT_STATUS = {
  draft: 'Rascunho',
  active: 'Ativo',
  expired: 'Vencido',
  cancelled: 'Cancelado',
  renewed: 'Renovado',
} as const;

export const TICKET_STATUS = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  resolved: 'Resolvido',
  closed: 'Encerrado',
} as const;

export const DOCUMENT_STATUS = {
  pending: 'Pendente',
  active: 'Ativo',
  rejected: 'Recusado',
  archived: 'Arquivado',
} as const;

export const COMMISSION_STATUS = {
  pending: 'Pendente',
  approved: 'Aprovada',
  paid: 'Paga',
  cancelled: 'Cancelada',
} as const;

export const TICKET_PRIORITY = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
} as const;

export const DOCUMENT_VISIBILITY = {
  private: 'Interno',
  client: 'Cliente',
  public: 'Público',
} as const;

export function getStatusLabel(statusMap: Record<string, string>, value: string): string {
  return statusMap[value] || value;
}
