import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/lib/auth-types';
import { Loader2 } from 'lucide-react';

type RouteRole = AppRole | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Require any of these roles. Empty = just authenticated. */
  requiredRoles?: RouteRole[];
  /** Require a specific permission key from the matrix. */
  requiredPermission?: string;
  /** Custom fallback when unauthorized (default: redirect to login) */
  fallbackPath?: string;
  /** Whether this route requires MFA verification (default: auto-detect from roles) */
  requireMfa?: boolean;
}

const normalizeRouteRole = (role: RouteRole): AppRole => {
  return role === 'admin' ? 'administrativo' : role;
};

const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requiredPermission,
  fallbackPath = '/login',
  requireMfa,
}: ProtectedRouteProps) => {
  const {
    isAuthenticated,
    isLoading,
    roles,
    hasPermission,
    hasAnyRole,
    profile,
    mfaRequired,
    mfaVerified,
    mfaEnrolled,
  } = useAuth();
  const location = useLocation();
  const normalizedRequiredRoles = requiredRoles.map(normalizeRouteRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn('[ProtectedRoute] unauthenticated redirect', { path: location.pathname, fallbackPath });
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (profile && !profile.is_active) {
    console.warn('[ProtectedRoute] blocked inactive account', { path: location.pathname });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Conta desativada</h2>
          <p className="text-muted-foreground">
            Sua conta foi desativada. Entre em contato com o suporte para mais informações.
          </p>
        </div>
      </div>
    );
  }

  const needsMfa = requireMfa !== undefined ? requireMfa : mfaRequired;
  if (needsMfa && !mfaVerified) {
    console.warn('[ProtectedRoute] redirecting to MFA', {
      path: location.pathname,
      mfaEnrolled,
      roles,
    });

    if (!mfaEnrolled) {
      return <Navigate to="/mfa/setup" state={{ from: location }} replace />;
    }

    return <Navigate to="/mfa/verify" state={{ from: location }} replace />;
  }

  if (normalizedRequiredRoles.length > 0 && !hasAnyRole(normalizedRequiredRoles)) {
    console.warn('[ProtectedRoute] access denied by role', {
      path: location.pathname,
      requiredRoles,
      normalizedRequiredRoles,
      currentRoles: roles,
    });
    return <Navigate to="/acesso-negado" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.warn('[ProtectedRoute] access denied by permission', {
      path: location.pathname,
      requiredPermission,
      currentRoles: roles,
    });
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
