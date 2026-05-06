import { ReactNode } from 'react';
import { useHasPermission } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  code: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Wraps content that should only render when the user has the given permission.
 * Render-time guard for UX — DB RLS remains the source of truth for security.
 */
export function PermissionGuard({ code, fallback = null, children }: PermissionGuardProps) {
  const allowed = useHasPermission(code);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
