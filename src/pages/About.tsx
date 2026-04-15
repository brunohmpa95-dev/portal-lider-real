import { Link } from 'react-router-dom';
import { Eye, Heart, Zap, Shield, Clock, Smile, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { COMPANY } from '@/data/constants';
import founderImg from '@/assets/founder.png';

const values = [
  { icon: Eye, title: 'Clareza acima de tudo', text: 'Falamos a verdade, sempre. Sem rodeios, sem promessas irreais, apenas transparência em cada negociação.' },
  { icon: Heart, title: 'O cliente é o centro', text: 'Cada decisão que tomamos parte de uma pergunta: isso é o melhor para o cliente?' },
  { icon: Zap, title: 'Proatividade que gera resultado', text: 'Não esperamos acontecer, antecipamos, resolvemos e agimos. Quem planta bem hoje, colhe resultados amanhã.' },
  { icon: Shield, title: 'Transparência em cada etapa', text: 'Do primeiro contato à entrega das chaves, o cliente sabe exatamente o que está acontecendo — sem dúvidas, sem surpresas.' },
  { icon: Clock, title: 'Agilidade com atenção', text: 'Resposta rápida, atendimento presente e cuidado em cada detalhe. Tempo é valioso, e a gente respeita isso.' },
  { icon: Smile, title: 'Servir é um prazer', text: 'Ajudar não é obrigação, é propósito. Trabalhamos com vontade genuína de fazer o bem para cada cliente.' },
  { icon: TrendingUp, title: 'Evolução constante', text: 'Estamos sempre estudando, inovando e melhorando. O mercado muda e nós evoluímos junto.' },
];

const About = () => (
  <Layout>
    <PageHead title="Sobre" description="Conheça a Líder Imóveis Itaúna. Transformando a experiência imobiliária com transparência, inovação e compromisso real." />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Sobre' }]} />

      <div className="max-w-5xl mx-auto">
        {/* Hero — foto + texto */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
          <div className="md:w-2/5 flex-shrink-0">
            <img
              src={founderImg}
              alt="Fundador da Líder Imóveis"
              className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-lg mx-auto" loading="lazy"
            />
          </div>

          <div className="md:w-3/5">
            <h1 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
              Quem somos
            </h1>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A <strong className="text-foreground">Líder Imóveis Itaúna</strong> nasceu de um propósito: transformar a forma como as pessoas vivem a experiência de comprar e vender imóveis.
              </p>
              <p>
                Tudo começou com uma paixão genuína pelo mercado imobiliário, por casas, histórias e pelo impacto que um imóvel certo pode gerar na vida de alguém. Quando surgiu a oportunidade de atuar na área, ficou claro que esse era o caminho.
              </p>
              <p>
                Mesmo em fase inicial, nossa construção é sólida: baseada em estudo constante, inovação e um compromisso real com cada cliente. Em um mercado muitas vezes amador, escolhemos fazer diferente — com profissionalismo, transparência e atenção aos detalhes.
              </p>
              <p>
                Nosso sonho é grande: nos tornar uma imobiliária referência no Brasil, conectando pessoas aos seus imóveis ideais em qualquer lugar do país.
              </p>
              <p>
                Mais do que vender imóveis, queremos construir relações, gerar confiança e entregar experiências que realmente façam sentido para nossos clientes!
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-sans font-semibold text-foreground mb-8">Nossos Valores</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {values.map(v => (
            <div key={v.title} className="bg-card border border-border rounded-lg p-6">
              <v.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-sans font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>

        {/* CRECI */}
        <div className="bg-secondary rounded-lg p-8 text-center mb-16">
          <p className="text-sm text-muted-foreground mb-2">Registro profissional</p>
          <p className="text-2xl font-sans font-bold text-foreground">{COMPANY.creci}</p>
          <p className="text-sm text-muted-foreground mt-2">{COMPANY.address}</p>
        </div>

        {/* CTA */}
        <div className="text-center pb-16">
          <h2 className="text-2xl font-sans font-semibold text-foreground mb-4">Fale com a gente</h2>
          <p className="text-muted-foreground mb-6">Estamos prontos para ajudar você a encontrar o imóvel ideal.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/contato" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
              Entrar em contato
            </Link>
            <Link to="/area-do-cliente" className="inline-flex items-center justify-center gap-2 border border-border bg-background px-6 py-3 rounded-md font-medium hover:bg-secondary transition-colors">
              Área do Cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default About;
