import { Link } from 'react-router-dom';
import { Shield, Users, Award, Target } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { COMPANY } from '@/data/constants';

const values = [
  { icon: Shield, title: 'Confiança', text: 'Transparência em cada negociação, do primeiro contato à entrega das chaves.' },
  { icon: Users, title: 'Atendimento Humano', text: 'Equipe dedicada que entende suas necessidades e acompanha cada etapa.' },
  { icon: Award, title: 'Experiência', text: 'Mais de 15 anos de atuação sólida no mercado imobiliário de Itaúna.' },
  { icon: Target, title: 'Compromisso', text: 'Foco em resultados concretos para compradores, vendedores e locatários.' },
];

const About = () => (
  <Layout>
    <PageHead title="Sobre" description="Conheça a Líder Imóveis Itaúna. Mais de 15 anos de tradição e confiança no mercado imobiliário de Itaúna - MG." />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Sobre' }]} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
          Quem somos
        </h1>

        <div className="prose prose-lg max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed text-lg mb-6">
            A <strong className="text-foreground">Líder Imóveis</strong> nasceu do desejo de transformar a experiência imobiliária em Itaúna e região. Fundada há mais de 15 anos, nos consolidamos como referência regional em compra, venda e locação de imóveis, sempre priorizando a relação de confiança com nossos clientes.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Nossa equipe é formada por profissionais com profundo conhecimento do mercado local, capazes de orientar desde a escolha do bairro ideal até a finalização contratual. Acreditamos que cada pessoa e cada imóvel têm uma história — e nossa missão é conectar essas histórias da melhor forma possível.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Fazemos parte de um ecossistema integrado de gestão imobiliária, o que nos permite oferecer agilidade, organização e acompanhamento completo em todas as etapas do processo. Do primeiro contato ao pós-venda, cada detalhe é cuidado com a atenção que você merece.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-sans font-semibold text-foreground mb-8">Nossos Valores</h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
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
