import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthenticatorAssuranceLevels } from '@supabase/supabase-js';
import { type AppRole, type AuthState, MFA_REQUIRED_ROLES, hasPermission as checkPerm, hasAnyRole as checkAnyRoles } from '@/lib/auth-types';

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signOutAllSessions: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  refreshRoles: () => Promise<void>;
  refreshMfaStatus: () => Promise<void>;
  hasPermission: (permissionKey: string) => boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  /** Whether the current user needs MFA but hasn't completed it this session */
  mfaRequired: boolean;
  /** Whether the user has achieved AAL2 (TOTP verified) this session */
  mfaVerified: boolean;
  /** Whether the user has enrolled a TOTP factor */
  mfaEnrolled: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function safeErrorMessage(error: any): string {
  const msg = error?.message?.toLowerCase() || '';
  if (msg.includes('invalid login') || msg.includes('invalid email') || msg.includes('invalid password')) {
    return 'E-mail ou senha incorretos.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos.';
  }
  if (msg.includes('user already registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (msg.includes('weak password') || msg.includes('password')) {
    return 'A senha deve ter no mínimo 8 caracteres.';
  }
  return 'Ocorreu um erro. Tente novamente.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthState['profile']>(null);
  const [isLoading, setIsLoading] = useState(true);

  // MFA state
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url, is_active, mfa_required')
        .eq('user_id', userId)
        .single();
      setProfile(data || null);
    } catch {
      setProfile(null);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await supabase.rpc('get_my_roles');
      setRoles((data as AppRole[]) || []);
    } catch {
      setRoles([]);
    }
  }, []);

  const checkMfaStatus = useCallback(async () => {
    try {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setMfaVerified(aalData?.currentLevel === 'aal2');

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedFactors = (factorsData?.totp || []).filter((f) => f.status === 'verified');
      setMfaEnrolled(verifiedFactors.length > 0);
    } catch {
      setMfaVerified(false);
      setMfaEnrolled(false);
    }
  }, []);

  const refreshRoles = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  const refreshMfaStatus = useCallback(async () => {
    await checkMfaStatus();
  }, [checkMfaStatus]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(async () => {
            await fetchProfile(newSession.user.id);
            await fetchRoles();
            await checkMfaStatus();
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setMfaVerified(false);
          setMfaEnrolled(false);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        await Promise.all([
          fetchProfile(existingSession.user.id),
          fetchRoles(),
          checkMfaStatus(),
        ]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRoles, checkMfaStatus]);

  // Compute whether MFA is required for this user
  const mfaRequired = (() => {
    // Profile-level flag
    if (profile?.mfa_required) return true;
    // Role-based requirement
    return roles.some((r) => MFA_REQUIRED_ROLES.includes(r));
  })();

  // Fire-and-forget audit logging
  const logAuthEvent = (action: string, result: string, metadata?: Record<string, unknown>, tokenOverride?: string) => {
    try {
      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/form-submit`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const getToken = tokenOverride
        ? Promise.resolve(tokenOverride)
        : supabase.auth.getSession().then(({ data: { session: s } }) => s?.access_token || null);
      getToken.then((token) => {
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ form_type: 'audit_event', action, result, metadata }),
        }).catch(() => {});
      }).catch(() => {});
    } catch { /* never block auth flow */ }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logAuthEvent('login_failed', 'denied', { reason: 'invalid_credentials' });
      return { error: safeErrorMessage(error) };
    }
    logAuthEvent('login', 'success', { method: 'password' });
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: safeErrorMessage(error) };
    return { error: null };
  };

  const signOut = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const token = currentSession?.access_token;
    await supabase.auth.signOut();
    if (token) logAuthEvent('logout', 'success', { scope: 'local' }, token);
    setUser(null);
    setSession(null);
    setRoles([]);
    setProfile(null);
    setMfaVerified(false);
    setMfaEnrolled(false);
  };

  const signOutAllSessions = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const token = currentSession?.access_token;
    await supabase.auth.signOut({ scope: 'global' });
    if (token) logAuthEvent('logout', 'success', { scope: 'global' }, token);
    setUser(null);
    setSession(null);
    setRoles([]);
    setProfile(null);
    setMfaVerified(false);
    setMfaEnrolled(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) console.error('Reset password error (hidden from user)');
    return { error: null };
  };

  const updatePasswordFn = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: safeErrorMessage(error) };
    return { error: null };
  };

  const permissionCheck = useCallback((permissionKey: string): boolean => {
    return checkPerm(roles, permissionKey);
  }, [roles]);

  const roleCheck = useCallback((role: AppRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const anyRoleCheck = useCallback((requiredRoles: AppRole[]): boolean => {
    return checkAnyRoles(roles, requiredRoles);
  }, [roles]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        profile,
        isLoading,
        isAuthenticated: !!session && !!user,
        signIn,
        signUp,
        signOut,
        signOutAllSessions,
        resetPassword,
        updatePassword: updatePasswordFn,
        refreshRoles,
        refreshMfaStatus,
        hasPermission: permissionCheck,
        hasRole: roleCheck,
        hasAnyRole: anyRoleCheck,
        mfaRequired,
        mfaVerified,
        mfaEnrolled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
