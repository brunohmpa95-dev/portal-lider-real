import { Link } from 'react-router-dom';
import { User, Building2, Phone, HandshakeIcon, Headphones, ArrowRight, Shield } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import SearchBar from '@/components/property/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import PremiumPropertyCard from '@/components/property/PremiumPropertyCard';
import { Button } from '@/components/ui/button';
import { getFeaturedProperties, getSuperFeaturedProperty } from '@/data/properties';
import { COMPANY } from '@/data/constants';

const systemShortcuts = [
  { icon: User, label: 'Área do Cliente', desc: 'Acesse sua conta e serviços', path: '/area-do-cliente' },
  { icon: Building2, label: 'Envie seu Imóvel', desc: 'Cadastre para análise', path: '/anuncie' },
  { icon: Phone, label: 'Fale com Locação', desc: 'Atendimento especializado', path: '/contato' },
  { icon: HandshakeIcon, label: 'Fale com Vendas', desc: 'Consultoria personalizada', path: '/contato' },
  { icon: Headphones, label: 'Solicite Atendimento', desc: 'Suporte rápido', path: '/contato' },
];

const Index = () => {
  const superFeatured = getSuperFeaturedProperty();
  const featuredSale = getFeaturedProperties('sale').filter(p => !p.isSuperFeatured);
  const featuredRent = getFeaturedProperties('rent');

  return (
    <Layout>
      <PageHead title="Início" description="Líder Imóveis Itaúna - Os melhores imóveis para comprar e alugar em Itaúna e região. Confiança e tradição no mercado imobiliário." />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-secondary to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
              Encontre o imóvel ideal<br className="hidden md:block" /> em Itaúna e região
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compra, venda e locação com a confiança de quem conhece cada bairro da cidade.
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      {/* System shortcuts */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {systemShortcuts.map(s => (
              <Link
                key={s.label}
                to={s.path}
                className="flex flex-col items-center text-center p-5 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <s.icon className="h-7 w-7 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-sans font-semibold text-sm text-foreground">{s.label}</span>
                <span className="text-xs text-muted-foreground mt-1">{s.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Super featured */}
      {superFeatured && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-8">
              Imóvel em Destaque
            </h2>
            <PremiumPropertyCard property={superFeatured} />
          </div>
        </section>
      )}

      {/* Featured for sale */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
              Imóveis à Venda
            </h2>
            <Link to="/comprar">
              <Button variant="outline" size="sm" className="gap-1.5">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSale.slice(0, 6).map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured for rent */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
              Imóveis para Locação
            </h2>
            <Link to="/alugar">
              <Button variant="outline" size="sm" className="gap-1.5">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRent.slice(0, 6).map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Institutional */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-4">
                Tradição e confiança no mercado imobiliário de Itaúna
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Há mais de 15 anos atuando no mercado imobiliário de Itaúna e região, a Líder Imóveis construiu uma reputação sólida baseada na transparência, conhecimento local e atendimento personalizado.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Nosso compromisso vai além da intermediação: acompanhamos cada etapa da sua jornada imobiliária com dedicação e expertise.
              </p>
              <Link to="/sobre">
                <Button variant="outline" className="gap-2">
                  Conheça nossa história <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-card border border-border rounded-xl p-8 text-center max-w-sm">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-3xl font-display font-bold text-foreground mb-1">+15 anos</p>
                <p className="text-muted-foreground text-sm">de experiência no mercado</p>
                <p className="text-xs text-muted-foreground mt-4">{COMPANY.creci}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Capture */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-semibold mb-4">
            Tem um imóvel para vender ou alugar?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 text-lg">
            Cadastre seu imóvel e conte com a nossa equipe para encontrar os melhores negócios.
          </p>
          <Link to="/anuncie">
            <Button variant="secondary" size="lg" className="gap-2 text-base">
              <Building2 className="h-5 w-5" /> Anuncie seu imóvel
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
