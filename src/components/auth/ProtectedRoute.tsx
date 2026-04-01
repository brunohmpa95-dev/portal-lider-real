import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/lib/auth-types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Require any of these roles. Empty = just authenticated. */
  requiredRoles?: AppRole[];
  /** Require a specific permission key from the matrix. */
  requiredPermission?: string;
  /** Custom fallback when unauthorized (default: redirect to login) */
  fallbackPath?: string;
  /** Whether this route requires MFA verification (default: auto-detect from roles) */
  requireMfa?: boolean;
}

const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requiredPermission,
  fallbackPath = '/login',
  requireMfa,
}: ProtectedRouteProps) => {
  const {
    isAuthenticated, isLoading, roles, hasPermission, hasAnyRole, profile,
    mfaRequired, mfaVerified, mfaEnrolled,
  } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated → login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Account deactivated
  if (profile && !profile.is_active) {
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

  // MFA enforcement
  const needsMfa = requireMfa !== undefined ? requireMfa : mfaRequired;
  if (needsMfa && !mfaVerified) {
    if (!mfaEnrolled) {
      // User needs to set up MFA first
      return <Navigate to="/mfa/setup" state={{ from: location }} replace />;
    }
    // User has TOTP enrolled but hasn't verified this session
    return <Navigate to="/mfa/verify" state={{ from: location }} replace />;
  }

  // Role check
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  // Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
