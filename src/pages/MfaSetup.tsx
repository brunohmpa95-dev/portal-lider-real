import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2, CheckCircle2, Copy } from 'lucide-react';

export default function MfaSetup() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'loading' | 'enroll' | 'verify' | 'done'>('loading');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate('/login', { replace: true }); return; }
    checkExistingFactors();
  }, [isLoading, isAuthenticated]);

  async function checkExistingFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    const totpFactors = data?.totp || [];
    const verified = totpFactors.filter((f) => f.status === 'verified');

    if (verified.length > 0) {
      setStep('done');
    } else {
      await startEnroll();
    }
  }

  async function startEnroll() {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Líder Imóveis TOTP',
    });

    if (error) {
      toast({ title: 'Erro ao configurar MFA', description: error.message, variant: 'destructive' });
      return;
    }

    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
    setStep('enroll');
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Digite o código de 6 dígitos.');
      return;
    }

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

    setStep('done');
    toast({ title: 'MFA ativado com sucesso!', description: 'Sua conta agora exige verificação em duas etapas.' });
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    toast({ title: 'Chave copiada' });
  }

  if (isLoading || step === 'loading') {
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
      <PageHead title="Configurar MFA" description="Ative a verificação em duas etapas para sua conta." />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verificação em Duas Etapas
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === 'done'
                ? 'Sua conta já está protegida com MFA.'
                : 'Configure um aplicativo autenticador para proteger sua conta.'}
            </p>
          </div>

          {step === 'enroll' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Escaneie o QR Code</CardTitle>
                <CardDescription>
                  Use um aplicativo autenticador como Google Authenticator, Authy ou 1Password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="QR Code para MFA" className="w-48 h-48" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ou insira a chave manualmente:</Label>
                  <div className="flex gap-2">
                    <Input value={secret} readOnly className="font-mono text-xs bg-muted" />
                    <Button variant="outline" size="icon" onClick={copySecret}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <CardTitle className="text-base mb-3">2. Digite o código do app</CardTitle>
                  <form onSubmit={handleVerify} className="space-y-3">
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
                    />
                    <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Verificar e Ativar
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'done' && (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h2 className="text-lg font-semibold mb-2">MFA Ativo</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Sua conta está protegida com verificação em duas etapas.
                </p>
                <Button onClick={() => navigate('/admin')} className="w-full">
                  Ir para o Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
