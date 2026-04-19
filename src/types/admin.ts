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
  message: string | null;
  property_id: string | null;
  assigned_to: string | null;
  source: string | null;
  status: string;
  priority: string;
  funnel_stage: string;
  tags: string[];
  internal_notes: string | null;
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
