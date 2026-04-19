import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/shared/BreadcrumbsJsonLd';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Mail, MapPin, Clock, Loader2, MessageCircle } from 'lucide-react';
import { COMPANY, DEPARTMENTS } from '@/data/constants';
import { submitForm } from '@/lib/form-submit';
import { useToast } from '@/hooks/use-toast';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';

const channelDescriptions: Record<string, string> = {
  sales: 'Compra de imóveis, visitas e propostas.',
  rental: 'Locação, contratos e dúvidas de inquilinos.',
  financial: 'Boletos, repasses e questões financeiras.',
  support: 'Atendimento geral e direcionamento.',
};

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

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Layout>
      <PageHead
        title="Contato"
        description="Fale com a Líder Imóveis Itaúna. Atendimento por WhatsApp, telefone ou e-mail para compra, venda, locação e suporte."
        keywords="contato Líder Imóveis, WhatsApp imobiliária Itaúna, telefone imobiliária Itaúna"
        canonical="/contato"
      />
      <BreadcrumbsJsonLd items={[{ name: 'Contato', path: '/contato' }]} />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Contato' }]} />

        <div className="max-w-4xl mx-auto pb-12">
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground mb-2">Fale com a Líder Imóveis</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-8">Escolha o canal mais conveniente. Resposta rápida no horário comercial.</p>

          {/* Quick contact bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <a href={`tel:${COMPANY.phone}`} className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-foreground">Ligar agora</span>
              <span className="text-[10px] text-muted-foreground">{COMPANY.phone}</span>
            </a>
            <a href={buildWhatsAppLink('speak')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-foreground">WhatsApp</span>
              <span className="text-[10px] text-muted-foreground">Resposta em minutos</span>
            </a>
            <a href={`mailto:${COMPANY.email}`} className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-foreground">E-mail</span>
              <span className="text-[10px] text-muted-foreground">Retorno em até 1 dia útil</span>
            </a>
            <div className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg p-4 text-center">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-foreground">Horário</span>
              <span className="text-[10px] text-muted-foreground">{COMPANY.hours}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form — 3 cols */}
            <div className="lg:col-span-3">
              {success ? (
                <div className="bg-accent rounded-lg p-8 text-center">
                  <h2 className="text-lg font-semibold text-foreground mb-2">Mensagem enviada!</h2>
                  <p className="text-sm text-muted-foreground">Retornaremos o mais breve possível.</p>
                  <Button size="sm" className="mt-5" onClick={() => setSuccess(false)}>Enviar outra</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 bg-card border border-border rounded-lg p-5">
                  <h2 className="font-sans font-semibold text-foreground text-sm mb-1">Envie uma mensagem</h2>
                  <p className="text-[11px] text-muted-foreground mb-2">Preencha os campos abaixo e nossa equipe entra em contato.</p>
                  <Input name="name" placeholder="Nome completo" required minLength={2} maxLength={100} className="h-10" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input name="email" placeholder="E-mail" type="email" required maxLength={255} className="h-10" />
                    <Input name="phone" placeholder="Telefone / WhatsApp" maxLength={20} className="h-10" />
                  </div>
                  <select name="subject" className={selectClass} aria-label="Assunto">
                    <option value="">Selecione o assunto</option>
                    <option value="compra">Compra de imóvel</option>
                    <option value="venda">Venda de imóvel</option>
                    <option value="locacao">Locação</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="outro">Outro</option>
                  </select>
                  <Textarea name="message" placeholder="Conte o que procura ou sua dúvida" rows={4} required minLength={10} maxLength={2000} />
                  <div className="flex items-start gap-2">
                    <Checkbox id="consent-contact" checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
                    <label htmlFor="consent-contact" className="text-[11px] text-muted-foreground leading-tight">
                      Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link>.
                    </label>
                  </div>
                  <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar mensagem'}
                  </Button>
                </form>
              )}
            </div>

            {/* Sidebar — 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-sans font-semibold text-foreground text-sm mb-3">Endereço</h2>
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />{COMPANY.address}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">Atendimento presencial no horário comercial.</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-sans font-semibold text-foreground text-sm mb-3">Departamentos</h2>
                <div className="space-y-3">
                  {Object.values(DEPARTMENTS).map(dept => (
                    <div key={dept.id} className="border-b border-border last:border-0 pb-2.5 last:pb-0">
                      <p className="font-medium text-foreground text-xs mb-0.5">{dept.name}</p>
                      <p className="text-[11px] text-muted-foreground italic mb-1">{channelDescriptions[dept.id]}</p>
                      <p className="text-[11px] text-muted-foreground">{dept.phone}</p>
                      <p className="text-[11px] text-muted-foreground">{dept.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
