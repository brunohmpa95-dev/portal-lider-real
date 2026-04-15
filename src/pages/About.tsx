import { Link } from 'react-router-dom';
import { Eye, Heart, Zap, Shield, Clock, Smile, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { COMPANY } from '@/data/constants';
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

const About = () => (
  <Layout>
    <PageHead title="Sobre" description="Conheça a Líder Imóveis Itaúna. Imobiliária moderna com atendimento próximo, transparente e comprometida com cada cliente." />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Sobre' }]} />

      <div className="max-w-4xl mx-auto pb-12">
        {/* Hero */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="md:w-2/5 shrink-0">
            <img
              src={founderImg}
              alt="Fundador da Líder Imóveis"
              className="w-56 h-56 md:w-72 md:h-72 object-cover rounded-2xl shadow-md mx-auto"
              loading="lazy"
            />
          </div>
          <div className="md:w-3/5">
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground mb-5">
              Quem somos
            </h1>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                A <strong className="text-foreground">Líder Imóveis Itaúna</strong> nasceu com um propósito claro: oferecer uma experiência imobiliária mais humana, transparente e eficiente.
              </p>
              <p>
                Somos uma imobiliária nova, mas construída com base em estudo constante, inovação e compromisso real com cada cliente. Em um mercado que muitas vezes carece de profissionalismo, escolhemos fazer diferente.
              </p>
              <p>
                Nosso sonho é nos tornar referência em Itaúna e região, conectando pessoas aos imóveis certos com agilidade, clareza e atendimento próximo.
              </p>
              <p>
                Mais do que intermediar negócios, queremos construir relações de confiança que façam sentido para quem compra, vende ou aluga.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-xl sm:text-2xl font-sans font-semibold text-foreground mb-6">Nossos Valores</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {values.map(v => (
            <div key={v.title} className="bg-card border border-border rounded-lg p-5">
              <v.icon className="h-7 w-7 text-primary mb-2.5" />
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
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-xl font-sans font-semibold text-foreground mb-3">Fale com a gente</h2>
          <p className="text-sm text-muted-foreground mb-5">Estamos prontos para ajudar você a encontrar o imóvel ideal.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link to="/contato" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto">
              Entrar em contato
            </Link>
            <Link to="/area-do-cliente" className="inline-flex items-center justify-center gap-2 border border-border bg-background px-6 py-2.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors w-full sm:w-auto">
              Área do Cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default About;
