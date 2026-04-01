import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(128);

const ResetPassword = () => {
  const { updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(parsed.data);
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
        <PageHead title="Senha atualizada" description="Sua senha foi redefinida com sucesso." />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center bg-card border border-border rounded-lg p-8">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Senha atualizada!</h1>
            <p className="text-muted-foreground mb-6">Sua senha foi redefinida com sucesso.</p>
            <Link to="/area-do-cliente">
              <Button>Ir para a Área do Cliente</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHead title="Redefinir Senha" description="Defina uma nova senha para sua conta." />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Nova senha
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Nova senha
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
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                Confirmar nova senha
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                maxLength={128}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
