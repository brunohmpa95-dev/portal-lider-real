import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { KeyRound } from 'lucide-react';

const emailSchema = z.string().trim().email('E-mail inválido').max(255);

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setIsSubmitting(true);
    await resetPassword(parsed.data);
    setIsSubmitting(false);
    setSent(true);
  };

  return (
    <Layout>
      <PageHead title="Recuperar Senha" description="Recupere sua senha na Líder Imóveis Itaúna." />
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <KeyRound className="h-8 w-8 text-primary mx-auto mb-3" />
            <h1 className="text-xl sm:text-2xl font-sans font-bold text-foreground mb-1">
              Recuperar senha
            </h1>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            {sent ? (
              <div className="text-center py-2">
                <p className="text-foreground font-semibold text-sm mb-1">Verifique seu e-mail</p>
                <p className="text-xs text-muted-foreground mb-5">
                  Se existe uma conta com esse e-mail, você receberá um link para redefinir sua senha.
                </p>
                <Link to="/login">
                  <Button variant="outline" size="sm">Voltar ao login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
                {error && (
                  <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md">{error}</div>
                )}
                <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} autoComplete="email" disabled={isSubmitting} className="h-10" />
                <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar link'}
                </Button>
                <p className="text-center text-xs">
                  <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
