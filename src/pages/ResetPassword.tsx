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
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      // Recovery mode detected
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
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-sm mx-auto text-center bg-card border border-border rounded-lg p-6">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3" />
            <h1 className="text-lg font-sans font-bold text-foreground mb-2">Senha atualizada!</h1>
            <p className="text-xs text-muted-foreground mb-5">Sua senha foi redefinida com sucesso.</p>
            <Link to="/area-do-cliente">
              <Button size="sm">Ir para a Área do Cliente</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHead title="Redefinir Senha" description="Defina uma nova senha para sua conta." />
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3" />
            <h1 className="text-xl sm:text-2xl font-sans font-bold text-foreground mb-1">Nova senha</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 bg-card border border-border rounded-lg p-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md">{error}</div>
            )}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1">Nova senha</label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} autoComplete="new-password" disabled={isSubmitting} className="h-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-foreground mb-1">Confirmar senha</label>
              <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required maxLength={128} autoComplete="new-password" disabled={isSubmitting} className="h-10" />
            </div>
            <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
