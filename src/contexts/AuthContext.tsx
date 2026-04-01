import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { type AppRole, type AuthState, hasPermission as checkPerm, hasAnyRole as checkAnyRoles } from '@/lib/auth-types';

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signOutAllSessions: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  refreshRoles: () => Promise<void>;
  hasPermission: (permissionKey: string) => boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
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

  const refreshRoles = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(async () => {
            await fetchProfile(newSession.user.id);
            await fetchRoles();
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
        fetchRoles();
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRoles]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Log failed login attempt (don't include email in metadata for security)
      await supabase.from('audit_log').insert({
        user_id: null,
        action: 'login_failed',
        resource: 'auth',
        result: 'denied',
        metadata: { reason: 'invalid_credentials' },
      }).then(() => {}, () => {});
      return { error: safeErrorMessage(error) };
    }
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) {
      await supabase.from('audit_log').insert({
        user_id: u.id,
        action: 'login',
        resource: 'auth',
        result: 'success',
        metadata: { method: 'password' },
      }).then(() => {}, () => {});
    }
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
    const currentUserId = user?.id;
    await supabase.auth.signOut();
    if (currentUserId) {
      await supabase.from('audit_log').insert({
        user_id: currentUserId,
        action: 'logout',
        resource: 'auth',
        result: 'success',
        metadata: { scope: 'local' },
      }).then(() => {}, () => {});
    }
    setUser(null);
    setSession(null);
    setRoles([]);
    setProfile(null);
  };

  const signOutAllSessions = async () => {
    const currentUserId = user?.id;
    await supabase.auth.signOut({ scope: 'global' });
    if (currentUserId) {
      await supabase.from('audit_log').insert({
        user_id: currentUserId,
        action: 'logout',
        resource: 'auth',
        result: 'success',
        metadata: { scope: 'global' },
      }).then(() => {}, () => {});
    }
    setUser(null);
    setSession(null);
    setRoles([]);
    setProfile(null);
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
        hasPermission: permissionCheck,
        hasRole: roleCheck,
        hasAnyRole: anyRoleCheck,
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
