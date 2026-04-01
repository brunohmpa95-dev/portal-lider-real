import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

export const ROLE_LABELS: Record<AppRole, string> = {
  cliente: 'Cliente',
  corretor: 'Corretor',
  locacao: 'Locação',
  vendas: 'Vendas',
  financeiro: 'Financeiro',
  administrativo: 'Administrativo',
  superadmin: 'Super Admin',
};

// Role hierarchy: higher index = more privileges
export const ROLE_HIERARCHY: AppRole[] = [
  'cliente',
  'corretor',
  'locacao',
  'vendas',
  'financeiro',
  'administrativo',
  'superadmin',
];

export const ADMIN_ROLES: AppRole[] = ['administrativo', 'superadmin'];
export const INTERNAL_ROLES: AppRole[] = ['corretor', 'locacao', 'vendas', 'financeiro', 'administrativo', 'superadmin'];
export const MFA_REQUIRED_ROLES: AppRole[] = ['financeiro', 'administrativo', 'superadmin'];

export interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  profile: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    mfa_required: boolean;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Permission {
  resource: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'manage';
}

// Permission matrix: which roles can do what
export const PERMISSION_MATRIX: Record<string, AppRole[]> = {
  // Client area
  'client-area:view': ['cliente', 'corretor', 'locacao', 'vendas', 'financeiro', 'administrativo', 'superadmin'],
  'client-documents:view': ['cliente', 'administrativo', 'superadmin'],
  
  // Properties
  'properties:view': [], // public
  'properties:create': ['corretor', 'vendas', 'administrativo', 'superadmin'],
  'properties:update': ['corretor', 'vendas', 'administrativo', 'superadmin'],
  'properties:delete': ['administrativo', 'superadmin'],
  
  // Leads
  'leads:view': ['corretor', 'vendas', 'locacao', 'administrativo', 'superadmin'],
  'leads:manage': ['administrativo', 'superadmin'],
  
  // Financial
  'financial:view': ['financeiro', 'administrativo', 'superadmin'],
  'financial:manage': ['financeiro', 'administrativo', 'superadmin'],
  
  // Ombudsman
  'ombudsman:view': ['administrativo', 'superadmin'],
  
  // Careers
  'careers:view': ['administrativo', 'superadmin'],
  
  // Users/Roles management
  'users:view': ['administrativo', 'superadmin'],
  'users:manage': ['superadmin'],
  'roles:manage': ['superadmin'],
  
  // Audit
  'audit:view': ['administrativo', 'superadmin'],
  
  // System settings
  'settings:manage': ['superadmin'],
};

export function hasPermission(roles: AppRole[], permissionKey: string): boolean {
  const allowedRoles = PERMISSION_MATRIX[permissionKey];
  if (!allowedRoles) return false;
  if (allowedRoles.length === 0) return true; // public
  return roles.some(role => allowedRoles.includes(role));
}

export function hasAnyRole(userRoles: AppRole[], requiredRoles: AppRole[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role));
}

export function isAdmin(roles: AppRole[]): boolean {
  return hasAnyRole(roles, ADMIN_ROLES);
}

export function isSuperAdmin(roles: AppRole[]): boolean {
  return roles.includes('superadmin');
}
