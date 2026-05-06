import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  CheckSquare,
  UserCog,
  Handshake,
  BarChart3,
  Settings,
  Bell,
  UserCircle,
  FileText,
  Headphones,
  DollarSign,
  Shield,
  MapPin,
  KeyRound,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { AppRole } from '@/lib/auth-types';

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  requiredRoles?: AppRole[];
  /** Optional permission code; if set, item only shows when user has this permission. */
  requiredPermission?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    label: 'Operacional',
    items: [
      { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { title: 'Leads', path: '/admin/leads', icon: Users },
      { title: 'Imóveis', path: '/admin/properties', icon: Building2 },
      { title: 'Clientes', path: '/admin/clientes', icon: Users, requiredRoles: ['administrativo', 'superadmin'] },
      { title: 'Bairros', path: '/admin/bairros', icon: MapPin, requiredRoles: ['administrativo', 'superadmin'] },
      { title: 'Agenda', path: '/admin/agenda', icon: CalendarDays },
      { title: 'Tarefas', path: '/admin/tarefas', icon: CheckSquare },
      { title: 'Chamados', path: '/admin/tickets', icon: Headphones, requiredRoles: ['administrativo', 'superadmin', 'locacao'] },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { title: 'Contratos', path: '/admin/contratos', icon: FileText, requiredRoles: ['administrativo', 'superadmin', 'locacao', 'vendas'] },
      { title: 'Corretores', path: '/admin/corretores', icon: Handshake, requiredRoles: ['administrativo', 'superadmin'] },
      { title: 'Parceiros', path: '/admin/partners', icon: Handshake, requiredRoles: ['administrativo', 'superadmin'] },
      { title: 'Documentos', path: '/admin/documentos', icon: FileText, requiredRoles: ['administrativo', 'superadmin'] },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { title: 'Financeiro', path: '/admin/financeiro', icon: DollarSign, requiredRoles: ['financeiro', 'administrativo', 'superadmin'] },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { title: 'Dashboard Gerencial', path: '/admin/gestao', icon: TrendingUp, requiredRoles: ['administrativo', 'superadmin', 'vendas', 'financeiro'] },
      { title: 'Relatórios', path: '/admin/reports', icon: BarChart3, requiredRoles: ['administrativo', 'superadmin', 'vendas', 'financeiro'] },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { title: 'Equipe', path: '/admin/team', icon: UserCog, requiredRoles: ['administrativo', 'superadmin'] },
      { title: 'Permissões', path: '/admin/permissoes', icon: KeyRound, requiredRoles: ['superadmin'] },
      { title: 'Auditoria', path: '/admin/auditoria', icon: Shield, requiredRoles: ['administrativo', 'superadmin'] },
      { title: 'Configurações', path: '/admin/settings', icon: Settings, requiredRoles: ['administrativo', 'superadmin'] },
    ],
  },
];

/** Flat list (kept for backward compatibility). */
export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_SECTIONS.flatMap((s) => s.items);

export const ADMIN_SECONDARY_NAV: NavItem[] = [
  { title: 'Notificações', path: '/admin/notifications', icon: Bell },
  { title: 'Meu Perfil', path: '/admin/profile', icon: UserCircle },
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

export function filterSectionsByRoles(sections: NavSection[], userRoles: AppRole[]): NavSection[] {
  return sections
    .map((s) => ({ ...s, items: filterNavByRoles(s.items, userRoles) }))
    .filter((s) => s.items.length > 0);
}
