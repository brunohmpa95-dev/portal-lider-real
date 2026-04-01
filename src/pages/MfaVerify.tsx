import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';

export default function MfaVerify() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.from?.pathname || '/admin';

  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate('/login', { replace: true }); return; }
    checkFactors();
  }, [isLoading, isAuthenticated]);

  async function checkFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    const totpFactors = (data?.totp || []).filter((f) => f.status === 'verified');

    if (totpFactors.length === 0) {
      // No verified factor — redirect to setup
      navigate('/mfa/setup', { replace: true });
      return;
    }

    // Check if already at AAL2
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === 'aal2') {
      navigate(returnTo, { replace: true });
      return;
    }

    setFactorId(totpFactors[0].id);
    setChecking(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;

    setVerifying(true);
    setError(null);

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setError('Erro ao criar desafio. Tente novamente.');
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    setVerifying(false);

    if (verifyError) {
      setError('Código inválido. Verifique e tente novamente.');
      setCode('');
      return;
    }

    toast({ title: 'Verificação bem-sucedida' });
    navigate(returnTo, { replace: true });
  }

  if (isLoading || checking) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHead title="Verificação MFA" description="Digite o código do seu aplicativo autenticador." />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verificação em Duas Etapas
            </h1>
            <p className="text-muted-foreground text-sm">
              Digite o código de 6 dígitos do seu aplicativo autenticador.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleVerify} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />

                <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
                  {verifying && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Verificar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
