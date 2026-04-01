import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { COMPANY, DEPARTMENTS } from '@/data/constants';
import { submitForm } from '@/lib/form-submit';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Contact = () => {
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
      await submitForm('contact', {
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        subject: fd.get('subject'),
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
      <PageHead title="Contato" description="Entre em contato com a Líder Imóveis Itaúna. Atendimento personalizado para compra, venda e locação de imóveis." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Contato' }]} />
        <h1 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-10">Fale Conosco</h1>

        <div className="grid lg:grid-cols-2 gap-12 pb-16">
          <div>
            {success ? (
              <div className="bg-accent rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Mensagem enviada!</h3>
                <p className="text-muted-foreground">Retornaremos em breve.</p>
                <Button className="mt-6" onClick={() => setSuccess(false)}>Enviar outra mensagem</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
                <Input name="name" placeholder="Nome completo" required minLength={2} maxLength={100} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input name="email" placeholder="E-mail" type="email" required maxLength={255} />
                  <Input name="phone" placeholder="Telefone" maxLength={20} />
                </div>
                <select name="subject" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-label="Assunto">
                  <option value="">Selecione o assunto</option>
                  <option value="compra">Compra de imóvel</option>
                  <option value="venda">Venda de imóvel</option>
                  <option value="locacao">Locação</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="outro">Outro</option>
                </select>
                <Textarea name="message" placeholder="Sua mensagem" rows={5} required minLength={10} maxLength={2000} />

                <div className="flex items-start gap-2">
                  <Checkbox id="consent-contact" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                  <label htmlFor="consent-contact" className="text-xs text-muted-foreground leading-tight">
                    Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link> e autorizo o tratamento dos meus dados para fins de atendimento.
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar mensagem'}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-sans text-lg font-semibold text-foreground mb-4">Informações</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />{COMPANY.address}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{COMPANY.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{COMPANY.email}</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{COMPANY.hours}</p>
              </div>
            </div>
            <div>
              <h2 className="font-sans text-lg font-semibold text-foreground mb-4">Contatos por Departamento</h2>
              <div className="space-y-4">
                {Object.values(DEPARTMENTS).map(dept => (
                  <div key={dept.id} className="bg-secondary rounded-lg p-4">
                    <p className="font-semibold text-foreground text-sm mb-1">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.phone} · {dept.email}</p>
                    <p className="text-xs text-muted-foreground">{dept.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
