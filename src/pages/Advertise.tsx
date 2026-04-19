import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/shared/BreadcrumbsJsonLd';
import FaqSection from '@/components/shared/FaqSection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PROPERTY_TYPES } from '@/data/constants';
import { useNeighborhoodNames } from '@/hooks/useNeighborhoods';
import { submitForm } from '@/lib/form-submit';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2, CheckCircle2, ClipboardList, Camera, Users, Handshake, ShieldCheck, MapPin, MessageCircle, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const steps = [
  { icon: ClipboardList, title: 'Avaliação gratuita', text: 'Analisamos seu imóvel com base no mercado local e sugerimos o melhor valor.' },
  { icon: Camera, title: 'Divulgação profissional', text: 'Fotos, descrição e anúncio em todos os nossos canais para atrair os interessados certos.' },
  { icon: Users, title: 'Triagem e visitas', text: 'Filtramos contatos, conduzimos as visitas e mantemos você informado.' },
  { icon: Handshake, title: 'Negociação e fechamento', text: 'Cuidamos da proposta, contrato e entrega — você só acompanha.' },
];

const benefits = [
  { icon: MapPin, title: 'Foco em Itaúna e região', text: 'Conhecimento real do mercado local — preços, demanda e bairros.' },
  { icon: ShieldCheck, title: 'CRECI ativo e processos claros', text: 'Imobiliária regularizada, com contrato e documentação transparentes.' },
  { icon: Users, title: 'Triagem séria de interessados', text: 'Você não recebe curiosos: filtramos antes de marcar visita.' },
  { icon: BadgeCheck, title: 'Suporte documental completo', text: 'Apoio em certidões, financiamento e tudo que envolve a transação.' },
];

const ownerFaq = [
  { q: 'Quanto custa para anunciar meu imóvel?', a: 'O cadastro e a avaliação são gratuitos. A comissão sobre a venda ou locação é cobrada apenas quando o negócio é fechado, conforme as condições combinadas em contrato.' },
  { q: 'Quanto tempo leva para começar a divulgar?', a: 'Após a avaliação e fotos, seu imóvel pode estar anunciado em poucos dias úteis em todos os nossos canais.' },
  { q: 'Posso anunciar em outras imobiliárias também?', a: 'Sim. Trabalhamos com exclusividade e não exclusividade. Conversamos sobre o que faz mais sentido para o seu caso.' },
  { q: 'Como vocês qualificam quem visita meu imóvel?', a: 'Fazemos uma pré-qualificação por telefone ou WhatsApp para entender o perfil do interessado antes de agendar a visita.' },
  { q: 'Quais documentos preciso para anunciar?', a: 'O essencial é a matrícula atualizada do imóvel e seus documentos pessoais. Orientamos toda a documentação necessária ao longo do processo.' },
];

const Advertise = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();
  const { data: NEIGHBORHOODS } = useNeighborhoodNames();
  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast({ title: "Consentimento necessário", description: "Você precisa concordar com a política de privacidade.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitForm('listing', {
        owner_name: fd.get('owner_name'),
        owner_phone: fd.get('owner_phone'),
        owner_email: fd.get('owner_email'),
        purpose: fd.get('purpose'),
        property_type: fd.get('property_type'),
        neighborhood: fd.get('neighborhood'),
        address: fd.get('address'),
        bedrooms: fd.get('bedrooms'),
        bathrooms: fd.get('bathrooms'),
        parking_spots: fd.get('parking_spots'),
        area: fd.get('area'),
        asking_price: fd.get('asking_price'),
        description: fd.get('description'),
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
      <PageHead
        title="Anuncie seu imóvel em Itaúna"
        description="Anuncie seu imóvel para venda ou locação com a Líder Imóveis Itaúna. Avaliação gratuita, divulgação profissional e suporte completo."
        keywords="anunciar imóvel Itaúna, vender casa Itaúna, alugar imóvel Itaúna, avaliação imóvel Itaúna"
        canonical="/anuncie"
      />
      <BreadcrumbsJsonLd items={[{ name: 'Anuncie seu imóvel', path: '/anuncie' }]} />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Anuncie seu imóvel' }]} />
        <div className="max-w-4xl mx-auto pb-4">
          {/* Hero */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Building2 className="h-3.5 w-3.5" /> Para proprietários
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-foreground mb-3">
              Anuncie seu imóvel com quem entende de Itaúna
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Avaliação gratuita, divulgação profissional, triagem de interessados e suporte documental — do anúncio à assinatura do contrato.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {benefits.map(b => (
              <div key={b.title} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <b.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-sans font-semibold text-foreground text-sm mb-0.5">{b.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <h2 className="text-lg sm:text-xl font-sans font-semibold text-foreground mb-2">Como funciona</h2>
          <p className="text-sm text-muted-foreground mb-5">Quatro etapas simples e acompanhadas pela nossa equipe.</p>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            {steps.map((s, i) => (
              <li key={s.title} className="relative bg-secondary/60 rounded-lg p-4">
                <span className="absolute -top-2.5 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
                <s.icon className="h-5 w-5 text-primary mb-2 mt-1" aria-hidden="true" />
                <p className="font-semibold text-foreground text-xs mb-1">{s.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>

          {/* Form */}
          {success ? (
            <div className="bg-accent rounded-lg p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Imóvel cadastrado!</h2>
              <p className="text-sm text-muted-foreground">Nossa equipe vai analisar e entrar em contato em breve para os próximos passos.</p>
              <Button size="sm" className="mt-5" onClick={() => setSuccess(false)}>Cadastrar outro imóvel</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 sm:p-6">
              <h2 className="font-sans font-semibold text-foreground text-base mb-1">Cadastre seu imóvel</h2>
              <p className="text-xs text-muted-foreground mb-5">Quanto mais detalhes, mais rápido conseguimos preparar a divulgação.</p>

              {/* Owner info */}
              <h3 className="font-sans font-semibold text-foreground text-sm mb-3">Seus dados</h3>
              <div className="space-y-3 mb-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input name="owner_name" placeholder="Nome completo" required minLength={2} maxLength={100} className="h-10" />
                  <Input name="owner_phone" placeholder="Telefone / WhatsApp" required maxLength={20} className="h-10" />
                </div>
                <Input name="owner_email" placeholder="E-mail" type="email" required maxLength={255} className="h-10" />
              </div>

              {/* Property info */}
              <h3 className="font-sans font-semibold text-foreground text-sm mb-3">Dados do imóvel</h3>
              <div className="space-y-3 mb-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <select name="purpose" className={selectClass} aria-label="Finalidade" required>
                    <option value="">Finalidade</option>
                    <option value="sale">Venda</option>
                    <option value="rent">Locação</option>
                  </select>
                  <select name="property_type" className={selectClass} aria-label="Tipo do imóvel" required>
                    <option value="">Tipo do imóvel</option>
                    {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <select name="neighborhood" className={selectClass} aria-label="Bairro">
                    <option value="">Bairro</option>
                    {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <Input name="address" placeholder="Endereço (opcional)" maxLength={200} className="h-10" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input name="bedrooms" placeholder="Quartos" type="number" min={0} max={99} className="h-10" />
                  <Input name="bathrooms" placeholder="Banheiros" type="number" min={0} max={99} className="h-10" />
                  <Input name="parking_spots" placeholder="Vagas" type="number" min={0} max={99} className="h-10" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input name="area" placeholder="Área (m²)" type="number" min={0} max={999999} className="h-10" />
                  <Input name="asking_price" placeholder="Valor pretendido (R$)" type="number" min={0} max={999999999} className="h-10" />
                </div>
                <Textarea name="description" placeholder="Detalhes adicionais — diferenciais, estado de conservação, observações" rows={3} maxLength={2000} />
              </div>

              <div className="flex items-start gap-2 mb-4">
                <Checkbox id="consent-listing" checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
                <label htmlFor="consent-listing" className="text-[11px] text-muted-foreground leading-tight">
                  Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link> e autorizo o contato da Líder Imóveis sobre este imóvel.
                </label>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar para análise'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground mb-2">Prefere conversar primeiro?</p>
                <a
                  href={buildWhatsAppLink('list')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Tirar dúvidas no WhatsApp
                </a>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* FAQ */}
      <FaqSection items={ownerFaq} title="Dúvidas de proprietários" subtitle="As perguntas que mais ouvimos de quem quer anunciar." />
    </Layout>
  );
};

export default Advertise;
