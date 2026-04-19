import { Link } from 'react-router-dom';
import { Eye, Heart, Zap, Shield, Clock, Smile, TrendingUp, MessageCircle, Search, Calendar, Handshake } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/shared/BreadcrumbsJsonLd';
import { Button } from '@/components/ui/button';
import { COMPANY } from '@/data/constants';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import founderImg from '@/assets/founder.png';

const values = [
  { icon: Eye, title: 'Clareza acima de tudo', text: 'Falamos a verdade, sempre. Sem rodeios e sem promessas irreais.' },
  { icon: Heart, title: 'O cliente é o centro', text: 'Cada decisão parte de uma pergunta: isso é o melhor para o cliente?' },
  { icon: Zap, title: 'Proatividade que gera resultado', text: 'Antecipamos, resolvemos e agimos antes que o problema apareça.' },
  { icon: Shield, title: 'Transparência em cada etapa', text: 'Do primeiro contato à entrega das chaves, sem dúvidas e sem surpresas.' },
  { icon: Clock, title: 'Agilidade com atenção', text: 'Resposta rápida, atendimento presente e cuidado em cada detalhe.' },
  { icon: Smile, title: 'Servir é um prazer', text: 'Trabalhamos com vontade genuína de fazer o bem para cada cliente.' },
  { icon: TrendingUp, title: 'Evolução constante', text: 'Estamos sempre estudando, inovando e melhorando nossos processos.' },
];

const process = [
  { icon: MessageCircle, title: '1. Primeiro contato', text: 'Você fala com a gente pelo WhatsApp, telefone, formulário ou pessoalmente. Entendemos o que você procura.' },
  { icon: Search, title: '2. Curadoria de imóveis', text: 'Selecionamos opções alinhadas ao seu perfil — sem encher sua caixa de mensagens com imóveis fora do critério.' },
  { icon: Calendar, title: '3. Visitas acompanhadas', text: 'Agendamos visitas no seu horário, sempre com um corretor presente para esclarecer dúvidas reais.' },
  { icon: Handshake, title: '4. Negociação e fechamento', text: 'Conduzimos proposta, documentação e contrato com transparência total até a assinatura.' },
];

const About = () => (
  <Layout>
    <PageHead
      title="Sobre a Líder Imóveis"
      description="Imobiliária em Itaúna com atendimento próximo, transparente e foco regional. Conheça nossa proposta, valores e processo de atendimento."
      keywords="imobiliária Itaúna, sobre Líder Imóveis, corretor Itaúna, CRECI Itaúna"
      canonical="/sobre"
    />
    <BreadcrumbsJsonLd items={[{ name: 'Sobre', path: '/sobre' }]} />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Sobre' }]} />

      <div className="max-w-4xl mx-auto pb-12">
        {/* Hero */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="md:w-2/5 shrink-0">
            <img
              src={founderImg}
              alt="Fundador da Líder Imóveis Itaúna"
              className="w-56 h-56 md:w-72 md:h-72 object-cover rounded-2xl shadow-md mx-auto"
              loading="lazy"
            />
          </div>
          <div className="md:w-3/5">
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground mb-5">
              A imobiliária próxima de quem mora em Itaúna
            </h1>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                A <strong className="text-foreground">Líder Imóveis Itaúna</strong> nasceu para oferecer um atendimento mais humano, transparente e eficiente em compra, venda e locação de imóveis na região.
              </p>
              <p>
                Somos uma imobiliária nova, mas construída com base em estudo constante, processos bem definidos e compromisso real com cada cliente. Em um mercado que muitas vezes carece de profissionalismo, escolhemos fazer diferente.
              </p>
              <p>
                Nosso foco é ser referência em Itaúna e região, conectando pessoas aos imóveis certos com agilidade, clareza e atendimento próximo — do primeiro contato à entrega das chaves.
              </p>
            </div>
          </div>
        </div>

        {/* Process */}
        <h2 className="text-xl sm:text-2xl font-sans font-semibold text-foreground mb-2">Como atendemos</h2>
        <p className="text-sm text-muted-foreground mb-6">Um processo claro, sem etapas obscuras, com você acompanhando tudo.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {process.map(p => (
            <div key={p.title} className="bg-card border border-border rounded-lg p-5">
              <p.icon className="h-6 w-6 text-primary mb-2.5" aria-hidden="true" />
              <h3 className="font-sans font-semibold text-foreground text-sm mb-1.5">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <h2 className="text-xl sm:text-2xl font-sans font-semibold text-foreground mb-6">Nossos valores</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {values.map(v => (
            <div key={v.title} className="bg-card border border-border rounded-lg p-5">
              <v.icon className="h-7 w-7 text-primary mb-2.5" aria-hidden="true" />
              <h3 className="font-sans font-semibold text-foreground text-sm mb-1">{v.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>

        {/* CRECI */}
        <div className="bg-secondary/60 rounded-lg p-6 text-center mb-12">
          <p className="text-xs text-muted-foreground mb-1">Registro profissional</p>
          <p className="text-xl font-sans font-bold text-foreground">{COMPANY.creci}</p>
          <p className="text-xs text-muted-foreground mt-1">{COMPANY.address}</p>
          <p className="text-xs text-muted-foreground mt-2">Cobertura: Itaúna e região metropolitana</p>
        </div>

        {/* CTA */}
        <div className="text-center bg-card border border-border rounded-lg p-6 sm:p-8">
          <h2 className="text-xl font-sans font-semibold text-foreground mb-2">Vamos conversar?</h2>
          <p className="text-sm text-muted-foreground mb-5">Conte o que você procura — comprar, alugar ou anunciar — e nossa equipe vai ajudar.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <a
              href={buildWhatsAppLink('speak')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#20BD5A] transition-colors w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
            <Link to="/contato" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">Outras formas de contato</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default About;
