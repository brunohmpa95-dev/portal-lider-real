import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Building2, Phone, ArrowRight, Shield, ExternalLink, MessageCircle, Headphones } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import heroBg from '@/assets/hero-bg.jpg';
import AnimatedSection from '@/components/shared/AnimatedSection';
import SearchBar from '@/components/property/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import PremiumPropertyCard from '@/components/property/PremiumPropertyCard';
import { Button } from '@/components/ui/button';
import { useFeaturedProperties, useSuperFeaturedProperty } from '@/hooks/useProperties';
import { COMPANY } from '@/data/constants';
import { Skeleton } from '@/components/ui/skeleton';

const PropertyGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[1, 2, 3].map(i => (
      <div key={i} className="rounded-lg border border-border overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const Index = () => {
  const { data: superFeatured, isLoading: loadingSuper } = useSuperFeaturedProperty();
  const { data: featuredSale = [], isLoading: loadingSale } = useFeaturedProperties('sale');
  const { data: featuredRent = [], isLoading: loadingRent } = useFeaturedProperties('rent');

  const saleFiltered = featuredSale.filter(p => !p.isSuperFeatured);

  return (
    <Layout>
      <PageHead title="Início" description="Líder Imóveis Itaúna - Imobiliária moderna em Itaúna e região. Compra, venda e locação de imóveis com atendimento próximo e transparente." />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["RealEstateAgent", "LocalBusiness"],
          "name": COMPANY.fullName,
          "description": "Imobiliária moderna em Itaúna e região. Compra, venda e locação de imóveis com atendimento próximo e transparente.",
          "url": "https://portal-lider-real.lovable.app",
          "telephone": COMPANY.phone,
          "email": COMPANY.email,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Expedito Alves, 67 - Nova Villa Mozart",
            "addressLocality": COMPANY.city,
            "addressRegion": COMPANY.state,
            "addressCountry": "BR"
          },
          "openingHours": ["Mo-Fr 08:00-18:00", "Sa 08:00-12:00"],
          "sameAs": [COMPANY.instagram, COMPANY.facebook],
          "image": "https://portal-lider-real.lovable.app/og-image.png"
        })}</script>
      </Helmet>

      {/* ─── Hero ─── */}
      <section
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/70" />
        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <motion.div
            className="text-center mb-8 md:mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-white mb-3 leading-tight">
              Encontre seu imóvel<br className="hidden sm:block" /> em Itaúna e região
            </h1>
            <p className="text-white/75 text-base sm:text-lg max-w-xl mx-auto">
              Compra, venda e locação com atendimento próximo e transparente.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* ─── Quick actions ─── */}
      <section className="py-8 md:py-10 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { icon: Phone, label: 'Fale com Locação', path: '/contato' },
              { icon: MessageCircle, label: 'Fale com Vendas', path: '/contato' },
              { icon: Headphones, label: 'Atendimento', path: '/contato' },
              { icon: Building2, label: 'Anuncie seu imóvel', path: '/anuncie' },
            ].map((s) => (
              <Link
                key={s.label}
                to={s.path}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <s.icon className="h-4 w-4 text-primary" />
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Super featured ─── */}
      {(loadingSuper || superFeatured) && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-6">Imóvel em Destaque</h2>
            {loadingSuper ? <Skeleton className="h-64 w-full rounded-lg" /> : superFeatured && <PremiumPropertyCard property={superFeatured} />}
          </div>
        </section>
      )}

      {/* ─── For sale ─── */}
      <section className="py-12 md:py-16 bg-secondary/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground">Imóveis à Venda</h2>
            <Link to="/comprar">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {loadingSale ? <PropertyGridSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {saleFiltered.slice(0, 6).map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
            </div>
          )}
          {!loadingSale && saleFiltered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum imóvel em destaque para venda no momento.</p>
          )}
        </div>
      </section>

      {/* ─── For rent ─── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground">Imóveis para Locação</h2>
            <Link to="/alugar">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {loadingRent ? <PropertyGridSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredRent.slice(0, 6).map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
            </div>
          )}
          {!loadingRent && featuredRent.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum imóvel em destaque para locação no momento.</p>
          )}
        </div>
      </section>

      {/* ─── Institutional ─── */}
      <section className="py-12 md:py-16 bg-secondary/40">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-4">
                Uma nova imobiliária em Itaúna, com atendimento próximo e visão moderna
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                A Líder Imóveis Itaúna nasce com a proposta de oferecer um atendimento mais próximo, transparente e eficiente para quem deseja comprar, vender ou alugar imóveis na região.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Unimos agilidade, cuidado em cada etapa e conhecimento do mercado local para tornar sua experiência imobiliária mais simples e segura.
              </p>
              <Link to="/sobre">
                <Button variant="outline" className="gap-2">Conheça nossa proposta <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="bg-card border border-border rounded-xl p-8 text-center max-w-xs w-full">
                <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="text-lg font-sans font-bold text-foreground mb-1">Atendimento próximo</p>
                <p className="text-muted-foreground text-sm">Suporte personalizado para comprar, vender ou alugar com mais clareza e segurança.</p>
                <p className="text-xs text-muted-foreground mt-4">{COMPANY.creci}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Simulador CAIXA ─── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">Simule seu financiamento</h2>
          <p className="text-muted-foreground mb-5 text-sm sm:text-base">Use o simulador oficial da CAIXA para calcular parcelas e condições do seu financiamento.</p>
          <a
            href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm sm:text-base font-semibold text-white transition-colors"
            style={{ backgroundColor: '#005CA9' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#004a8a')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#005CA9')}
          >
            <ExternalLink className="h-4 w-4" /> Simular na CAIXA
          </a>
          <p className="text-muted-foreground text-xs mt-3">Você será redirecionado para o simulador oficial da CAIXA.</p>
        </div>
      </section>

      {/* ─── CTA Capture ─── */}
      <section className="py-14 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-xl md:text-2xl font-sans font-semibold mb-3">Tem um imóvel para vender ou alugar?</h2>
          <p className="text-primary-foreground/80 mb-6 text-sm sm:text-base">Cadastre seu imóvel e conte com a nossa equipe para encontrar os melhores negócios.</p>
          <Link to="/anuncie">
            <Button variant="secondary" size="lg" className="gap-2 text-sm sm:text-base">
              <Building2 className="h-5 w-5" /> Anuncie seu imóvel
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
