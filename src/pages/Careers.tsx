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

const Careers = () => {
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
      await submitForm('career', {
        applicant_name: fd.get('applicant_name'),
        applicant_email: fd.get('applicant_email'),
        applicant_phone: fd.get('applicant_phone'),
        area_of_interest: fd.get('area_of_interest'),
        experience: fd.get('experience'),
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
      <PageHead title="Trabalhe Conosco" description="Faça parte da equipe Líder Imóveis Itaúna. Envie seu currículo e venha crescer com a gente." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Trabalhe Conosco' }]} />
        <div className="max-w-2xl mx-auto pb-16">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Trabalhe Conosco</h1>
          <p className="text-muted-foreground mb-8">
            Estamos sempre em busca de profissionais comprometidos e apaixonados pelo mercado imobiliário. Envie seu currículo e venha fazer parte da nossa equipe.
          </p>

          {success ? (
            <div className="bg-accent rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Currículo enviado!</h3>
              <p className="text-muted-foreground">Agradecemos pelo interesse. Caso seu perfil seja compatível, entraremos em contato.</p>
              <Button className="mt-6" onClick={() => setSuccess(false)}>Enviar outro currículo</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
              <Input name="applicant_name" placeholder="Nome completo" required minLength={2} maxLength={100} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input name="applicant_email" placeholder="E-mail" type="email" required maxLength={255} />
                <Input name="applicant_phone" placeholder="Telefone / WhatsApp" required maxLength={20} />
              </div>
              <select name="area_of_interest" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-label="Área de interesse" required>
                <option value="">Área de interesse</option>
                <option value="vendas">Vendas</option>
                <option value="locacao">Locação</option>
                <option value="administrativo">Administrativo</option>
                <option value="marketing">Marketing</option>
                <option value="outro">Outro</option>
              </select>
              <Textarea name="experience" placeholder="Conte um pouco sobre sua experiência e motivação" rows={5} maxLength={3000} />

              <div className="flex items-start gap-2">
                <Checkbox id="consent-careers" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                <label htmlFor="consent-careers" className="text-xs text-muted-foreground leading-tight">
                  Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link> e autorizo o tratamento dos meus dados pessoais para fins de processo seletivo. Seus dados serão mantidos por até 12 meses.
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar currículo'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Careers;
