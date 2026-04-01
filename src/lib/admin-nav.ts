import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  UserCog,
  Handshake,
  BarChart3,
  Settings,
  Bell,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import type { AppRole } from '@/lib/auth-types';

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  requiredRoles?: AppRole[];
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    path: '/admin/leads',
    icon: Users,
  },
  {
    title: 'Imóveis',
    path: '/admin/properties',
    icon: Building2,
  },
  {
    title: 'Agenda',
    path: '/admin/agenda',
    icon: CalendarDays,
  },
  {
    title: 'Equipe',
    path: '/admin/team',
    icon: UserCog,
    requiredRoles: ['administrativo', 'superadmin'],
  },
  {
    title: 'Parceiros',
    path: '/admin/partners',
    icon: Handshake,
    requiredRoles: ['administrativo', 'superadmin'],
  },
  {
    title: 'Relatórios',
    path: '/admin/reports',
    icon: BarChart3,
    requiredRoles: ['administrativo', 'superadmin', 'vendas', 'financeiro'],
  },
  {
    title: 'Configurações',
    path: '/admin/settings',
    icon: Settings,
    requiredRoles: ['administrativo', 'superadmin'],
  },
];

export const ADMIN_SECONDARY_NAV: NavItem[] = [
  {
    title: 'Notificações',
    path: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Meu Perfil',
    path: '/admin/profile',
    icon: UserCircle,
  },
];

/** All roles that can access the admin panel */
export const ADMIN_ACCESS_ROLES: AppRole[] = [
  'corretor',
  'locacao',
  'vendas',
  'financeiro',
  'administrativo',
  'superadmin',
];

export function filterNavByRoles(items: NavItem[], userRoles: AppRole[]): NavItem[] {
  return items.filter((item) => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    return userRoles.some((r) => item.requiredRoles!.includes(r));
  });
}
