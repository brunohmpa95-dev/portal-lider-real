import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { submitForm } from '@/lib/form-submit';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Ombudsman = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast({ title: "Consentimento necessário", description: "Você precisa concordar com a política de privacidade.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);

    try {
      await submitForm('ombudsman', {
        reporter_name: fd.get('reporter_name'),
        reporter_email: fd.get('reporter_email'),
        reporter_phone: fd.get('reporter_phone'),
        ticket_type: fd.get('ticket_type'),
        message: fd.get('message'),
      });
      setSuccess(true);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHead title="Ouvidoria" description="Canal de ouvidoria da Líder Imóveis Itaúna. Envie sugestões, reclamações ou elogios." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Ouvidoria' }]} />
        <div className="max-w-2xl mx-auto pb-16">
          <h1 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-4">Ouvidoria</h1>
          <p className="text-muted-foreground mb-8">
            Este é o nosso canal de ouvidoria. Envie sugestões, reclamações, elogios ou denúncias. Todas as mensagens são tratadas com sigilo e seriedade.
          </p>

          {success ? (
            <div className="bg-accent rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Mensagem recebida!</h3>
              <p className="text-muted-foreground">Sua manifestação será analisada e respondida em até 5 dias úteis.</p>
              <Button className="mt-6" onClick={() => setSuccess(false)}>Enviar outra mensagem</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
              <Input name="reporter_name" placeholder="Nome completo" required minLength={2} maxLength={100} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input name="reporter_email" placeholder="E-mail" type="email" required maxLength={255} />
                <Input name="reporter_phone" placeholder="Telefone" maxLength={20} />
              </div>
              <select name="ticket_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-label="Tipo" required>
                <option value="">Tipo de manifestação</option>
                <option value="sugestao">Sugestão</option>
                <option value="reclamacao">Reclamação</option>
                <option value="elogio">Elogio</option>
                <option value="denuncia">Denúncia</option>
              </select>
              <Textarea name="message" placeholder="Descreva sua manifestação" rows={5} required minLength={10} maxLength={5000} />

              <div className="flex items-start gap-2">
                <Checkbox id="consent-ombudsman" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                <label htmlFor="consent-ombudsman" className="text-xs text-muted-foreground leading-tight">
                  Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link> e autorizo o tratamento dos meus dados para análise da manifestação. Seus dados são tratados com total sigilo.
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar manifestação'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Ombudsman;
