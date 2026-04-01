import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
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
const AUTH_TIMEOUT_MS = 5000;
const EMPTY_MFA_STATE = { verified: false, enrolled: false };

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

function withTimeoutFallback<T>(label: string, task: () => Promise<T>, fallback: T): Promise<T> {
  console.log(`[Auth] ${label}:start`);

  return new Promise((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      console.warn(`[Auth] ${label}:timeout`, { timeoutMs: AUTH_TIMEOUT_MS });
      resolve(fallback);
    }, AUTH_TIMEOUT_MS);

    task()
      .then((result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.log(`[Auth] ${label}:success`);
        resolve(result);
      })
      .catch((error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.error(`[Auth] ${label}:error`, error);
        resolve(fallback);
      });
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthState['profile']>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const syncRunRef = useRef(0);

  const resetDerivedAuthState = useCallback(() => {
    console.log('[Auth] resetDerivedAuthState');
    setProfile(null);
    setRoles([]);
    setMfaVerified(false);
    setMfaEnrolled(false);
  }, []);

  const loadProfile = useCallback(async (userId: string): Promise<AuthState['profile']> => {
    console.log('[Auth] loadProfile:request', { userId });
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url, is_active, mfa_required')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[Auth] loadProfile:error', error);
      return null;
    }

    console.log('[Auth] loadProfile:success', { userId, found: !!data });
    return data || null;
  }, []);

  const loadRoles = useCallback(async (): Promise<AppRole[]> => {
    console.log('[Auth] loadRoles:request');
    const { data, error } = await supabase.rpc('get_my_roles');

    if (error) {
      console.error('[Auth] loadRoles:error', error);
      return [];
    }

    const nextRoles = (data as AppRole[]) || [];
    console.log('[Auth] loadRoles:success', { roles: nextRoles });
    return nextRoles;
  }, []);

  const loadMfaStatus = useCallback(async () => {
    console.log('[Auth] loadMfaStatus:request');

    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) {
      console.error('[Auth] loadMfaStatus:aalError', aalError);
      return EMPTY_MFA_STATE;
    }

    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      console.error('[Auth] loadMfaStatus:factorsError', factorsError);
      return EMPTY_MFA_STATE;
    }

    const verifiedFactors = (factorsData?.totp || []).filter((factor) => factor.status === 'verified');
    const nextState = {
      verified: aalData?.currentLevel === 'aal2',
      enrolled: verifiedFactors.length > 0,
    };

    console.log('[Auth] loadMfaStatus:success', {
      currentLevel: aalData?.currentLevel ?? null,
      nextLevel: aalData?.nextLevel ?? null,
      ...nextState,
    });

    return nextState;
  }, []);

  const syncAuthState = useCallback(async (
    nextSession: Session | null,
    source: string,
    options: { blockUi?: boolean } = {},
  ) => {
    const runId = ++syncRunRef.current;
    const blockUi = options.blockUi ?? false;

    if (blockUi) {
      setIsLoading(true);
    }

    console.log('[Auth] syncAuthState:start', {
      source,
      runId,
      blockUi,
      hasSession: !!nextSession,
      userId: nextSession?.user?.id ?? null,
    });

    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      resetDerivedAuthState();
      if (syncRunRef.current === runId) {
        setIsLoading(false);
      }
      console.log('[Auth] syncAuthState:done-no-session', { source, runId });
      return;
    }

    const userId = nextSession.user.id;

    const [nextProfile, nextRoles, nextMfaState] = await Promise.all([
      withTimeoutFallback(`loadProfile:${source}`, () => loadProfile(userId), null),
      withTimeoutFallback(`loadRoles:${source}`, () => loadRoles(), [] as AppRole[]),
      withTimeoutFallback(`loadMfaStatus:${source}`, () => loadMfaStatus(), EMPTY_MFA_STATE),
    ]);

    if (syncRunRef.current !== runId) {
      console.warn('[Auth] syncAuthState:stale-run-ignored', { source, runId, latestRunId: syncRunRef.current });
      return;
    }

    setProfile(nextProfile);
    setRoles(nextRoles);
    setMfaVerified(nextMfaState.verified);
    setMfaEnrolled(nextMfaState.enrolled);
    setIsLoading(false);

    console.log('[Auth] syncAuthState:done', {
      source,
      runId,
      userId,
      roles: nextRoles,
      profileLoaded: !!nextProfile,
      mfaVerified: nextMfaState.verified,
      mfaEnrolled: nextMfaState.enrolled,
    });
  }, [loadMfaStatus, loadProfile, loadRoles, resetDerivedAuthState]);

  const refreshRoles = useCallback(async () => {
    const nextRoles = await withTimeoutFallback('refreshRoles', () => loadRoles(), [] as AppRole[]);
    setRoles(nextRoles);
  }, [loadRoles]);

  const refreshMfaStatus = useCallback(async () => {
    const nextMfaState = await withTimeoutFallback('refreshMfaStatus', () => loadMfaStatus(), EMPTY_MFA_STATE);
    setMfaVerified(nextMfaState.verified);
    setMfaEnrolled(nextMfaState.enrolled);
  }, [loadMfaStatus]);

  useEffect(() => {
    let isMounted = true;
    console.log('[Auth] provider:mount');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      const blockUi = event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED';
      console.log('[Auth] onAuthStateChange', {
        event,
        blockUi,
        userId: newSession?.user?.id ?? null,
      });

      void syncAuthState(newSession, `onAuthStateChange:${event}`, { blockUi });
    });

    void withTimeoutFallback(
      'getSession',
      async () => {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        return existingSession;
      },
      null,
    ).then((existingSession) => {
      if (!isMounted) return;

      console.log('[Auth] getSession:resolved', {
        hasSession: !!existingSession,
        userId: existingSession?.user?.id ?? null,
      });

      void syncAuthState(existingSession, 'bootstrap:getSession', { blockUi: true });
    });

    return () => {
      isMounted = false;
      console.log('[Auth] provider:unmount');
      subscription.unsubscribe();
    };
  }, [syncAuthState]);

  const mfaRequired = (() => {
    if (profile?.mfa_required) return true;
    return roles.some((role) => MFA_REQUIRED_ROLES.includes(role));
  })();

  const logAuthEvent = (action: string, result: string, metadata?: Record<string, unknown>, tokenOverride?: string) => {
    try {
      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/form-submit`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const getToken = tokenOverride
        ? Promise.resolve(tokenOverride)
        : supabase.auth.getSession().then(({ data: { session: currentSession } }) => currentSession?.access_token || null);

      getToken.then((token) => {
        if (token) headers.Authorization = `Bearer ${token}`;
        fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ form_type: 'audit_event', action, result, metadata }),
        }).catch(() => {});
      }).catch(() => {});
    } catch {
      // never block auth flow
    }
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
    resetDerivedAuthState();
    setIsLoading(false);
  };

  const signOutAllSessions = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const token = currentSession?.access_token;
    await supabase.auth.signOut({ scope: 'global' });
    if (token) logAuthEvent('logout', 'success', { scope: 'global' }, token);
    setUser(null);
    setSession(null);
    resetDerivedAuthState();
    setIsLoading(false);
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
