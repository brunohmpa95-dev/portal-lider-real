import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  FileText,
  DollarSign,
  UserCircle,
  Bell,
  type LucideIcon,
} from 'lucide-react';

export interface BrokerNavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export const BROKER_NAV_ITEMS: BrokerNavItem[] = [
  { title: 'Dashboard', path: '/parceiro', icon: LayoutDashboard },
  { title: 'Leads', path: '/parceiro/leads', icon: Users },
  { title: 'Imóveis', path: '/parceiro/imoveis', icon: Building2 },
  { title: 'Visitas', path: '/parceiro/visitas', icon: CalendarDays },
  { title: 'Propostas', path: '/parceiro/propostas', icon: FileText },
  { title: 'Comissões', path: '/parceiro/comissoes', icon: DollarSign },
];

export const BROKER_SECONDARY_NAV: BrokerNavItem[] = [
  { title: 'Notificações', path: '/parceiro/notificacoes', icon: Bell },
  { title: 'Meu Perfil', path: '/parceiro/perfil', icon: UserCircle },
];
