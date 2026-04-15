import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import logoImg from '@/assets/logo-transparent.png';
import { getPostLoginRedirect } from '@/lib/auth-types';

const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').max(255),
  password: z.string().min(1, 'Senha obrigatória').max(128),
});

const Login = () => {
  const { signIn, isAuthenticated, isLoading, mfaRequired, mfaVerified, mfaEnrolled, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stateFrom = (location.state as any)?.from?.pathname;
  // Use role-based redirect unless coming from a specific protected page
  const from = stateFrom || getPostLoginRedirect(roles);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (mfaRequired && !mfaVerified) {
      if (!mfaEnrolled) {
        navigate('/mfa/setup', { state: { from: { pathname: from } }, replace: true });
      } else {
        navigate('/mfa/verify', { state: { from: { pathname: from } }, replace: true });
      }
    } else {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, mfaRequired, mfaVerified, mfaEnrolled, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setIsSubmitting(true);
    const result = await signIn(parsed.data.email, parsed.data.password);
    setIsSubmitting(false);
    if (result.error) setError(result.error);
  };

  return (
    <Layout>
      <PageHead title="Entrar" description="Acesse sua conta na Líder Imóveis Itaúna." />
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-sm mx-auto">
          {/* Logo + heading */}
          <div className="text-center mb-6">
            <img src={logoImg} alt="Líder Imóveis" className="h-10 w-auto mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-sans font-bold text-foreground mb-1">
              Entrar na sua conta
            </h1>
            <p className="text-xs text-muted-foreground">
              Acesse a Área do Cliente para gerenciar seus imóveis e documentos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 bg-card border border-border rounded-lg p-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                maxLength={255}
                autoComplete="email"
                disabled={isSubmitting}
                className="h-10"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  maxLength={128}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <Link to="/recuperar-senha" className="text-primary hover:underline">
                Esqueceu a senha?
              </Link>
              <Link to="/cadastro" className="text-primary hover:underline">
                Criar conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
