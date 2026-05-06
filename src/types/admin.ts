export interface AdminProperty {
  id: string;
  code: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  condominium_fee: number;
  iptu: number;
  neighborhood: string | null;
  city: string;
  state: string;
  address: string | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking_spots: number;
  area: number;
  description: string | null;
  internal_notes: string | null;
  features: string[] | null;
  images: string[] | null;
  is_featured: boolean;
  is_super_featured: boolean;
  is_new: boolean;
  status: string;
  responsible_agent: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  message: string | null;
  property_id: string | null;
  client_id: string | null;
  assigned_to: string | null;
  source: string | null;
  channel: string | null;
  status: string;
  priority: string;
  temperature: string;
  funnel_stage: string;
  tags: string[];
  internal_notes: string | null;
  // Interesse
  interest_purpose: string | null;
  interest_property_type: string | null;
  interest_neighborhood_id: string | null;
  interest_min_price: number | null;
  interest_max_price: number | null;
  interest_bedrooms: number | null;
  // Funil / SLA
  next_followup_at: string | null;
  distributed_at: string | null;
  first_response_at: string | null;
  last_interaction_at: string | null;
  sla_status: string;
  distribution_rule_id: string | null;
  redistribution_count: number;
  // Perda
  lost_reason_id: string | null;
  lost_notes: string | null;
  lost_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  property_id: string | null;
  lead_id: string | null;
  agent_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  user_id: string;
  interaction_type: string;
  content: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  roles: string[];
}

export const PROPERTY_STATUS_OPTIONS = [
  { value: 'captacao', label: 'Captação' },
  { value: 'aguardando_documentacao', label: 'Aguardando documentação' },
  { value: 'published', label: 'Publicado' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'em_proposta', label: 'Em proposta' },
  { value: 'sold', label: 'Vendido' },
  { value: 'rented', label: 'Alugado' },
  { value: 'paused', label: 'Inativo' },
];

export const LEAD_FUNNEL_STAGES = [
  { value: 'new', label: 'Novo' },
  { value: 'contact', label: 'Contato' },
  { value: 'visit', label: 'Visita' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'negotiation', label: 'Negociação' },
  { value: 'closed', label: 'Fechado' },
  { value: 'lost', label: 'Perdido' },
];

export const LEAD_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export const LEAD_TEMPERATURE_OPTIONS = [
  { value: 'cold', label: 'Frio' },
  { value: 'warm', label: 'Morno' },
  { value: 'hot', label: 'Quente' },
];

export const LEAD_CHANNEL_OPTIONS = [
  { value: 'form_site', label: 'Formulário do site' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'dm_instagram', label: 'DM Instagram' },
  { value: 'dm_facebook', label: 'DM Facebook' },
  { value: 'ligacao', label: 'Ligação' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'portal', label: 'Portal imobiliário' },
  { value: 'outro', label: 'Outro' },
];

export const LEAD_SOURCE_OPTIONS = [
  { value: 'website', label: 'Site' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Telefone' },
  { value: 'referral', label: 'Indicação' },
  { value: 'social', label: 'Redes sociais' },
  { value: 'portal', label: 'Portal imobiliário' },
  { value: 'walk_in', label: 'Presencial' },
  { value: 'other', label: 'Outro' },
];

export const VISIT_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'completed', label: 'Realizada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'rescheduled', label: 'Reagendada' },
];

export const INTERACTION_TYPE_OPTIONS = [
  { value: 'note', label: 'Nota' },
  { value: 'call', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'visit', label: 'Visita' },
  { value: 'meeting', label: 'Reunião' },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'kitnet', label: 'Kitnet' },
  { value: 'chacara', label: 'Chácara' },
];

export const PROPERTY_PURPOSE_OPTIONS = [
  { value: 'sale', label: 'Venda' },
  { value: 'rent', label: 'Locação' },
];
