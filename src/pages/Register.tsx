import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().trim().email('E-mail inválido').max(255),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(128),
});

const Register = () => {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate('/area-do-cliente', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError('Você deve aceitar a Política de Privacidade para continuar.');
      return;
    }

    const parsed = registerSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(parsed.data.email, parsed.data.password, parsed.data.fullName);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Layout>
        <PageHead title="Conta criada" description="Confirme seu e-mail para acessar a Líder Imóveis." />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center bg-card border border-border rounded-lg p-8">
            <h1 className="text-2xl font-sans font-bold text-foreground mb-4">Verifique seu e-mail</h1>
            <p className="text-muted-foreground mb-6">
              Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
            </p>
            <Link to="/login">
              <Button variant="outline">Ir para o login</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHead title="Criar Conta" description="Crie sua conta na Líder Imóveis Itaúna." />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <UserPlus className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-sans font-bold text-foreground mb-2">
              Criar sua conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Cadastre-se para acessar a Área do Cliente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                Nome completo
              </label>
              <Input
                id="fullName"
                placeholder="Seu nome"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
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
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  maxLength={128}
                  autoComplete="new-password"
                  disabled={isSubmitting}
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

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                Li e concordo com a{' '}
                <Link to="/privacidade" className="text-primary hover:underline" target="_blank">
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
