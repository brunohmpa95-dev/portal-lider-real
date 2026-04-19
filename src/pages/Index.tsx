import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, ExternalLink, Phone, Home as HomeIcon, Key, Tag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import TrustStrip from '@/components/shared/TrustStrip';
import HowItWorks from '@/components/shared/HowItWorks';
import NeighborhoodsGrid from '@/components/shared/NeighborhoodsGrid';
import FaqSection from '@/components/shared/FaqSection';
import heroBg from '@/assets/hero-bg.jpg';
import SearchBar from '@/components/property/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import PremiumPropertyCard from '@/components/property/PremiumPropertyCard';
import { Button } from '@/components/ui/button';
import { useFeaturedProperties, useSuperFeaturedProperty } from '@/hooks/useProperties';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
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

const homeFaq = [
  { q: 'Quais regiões a Líder Imóveis atende?', a: 'Atendemos Itaúna e cidades da região, com foco em todos os principais bairros como Centro, Santa Edwiges, Piedade, São Geraldo, Vila Romana e demais regiões da cidade.' },
  { q: 'Como funciona o processo de compra de um imóvel?', a: 'Você escolhe o imóvel pelo site, agendamos uma visita acompanhada por um corretor, fazemos a proposta e cuidamos de toda documentação até a entrega das chaves, inclusive financiamento.' },
  { q: 'Posso anunciar meu imóvel para vender ou alugar?', a: 'Sim. Fazemos uma avaliação gratuita do seu imóvel, divulgamos em todos os nossos canais e cuidamos de visitas, negociação e contrato. Acesse a página "Anuncie seu imóvel" para começar.' },
  { q: 'Vocês trabalham com financiamento?', a: 'Sim. Orientamos toda a parte de financiamento e disponibilizamos um simulador oficial da CAIXA aqui no site para você calcular as condições antes de decidir.' },
  { q: 'Quanto tempo leva para responder uma mensagem?', a: 'Respondemos em minutos pelo WhatsApp dentro do horário comercial e em até 1 dia útil pelo e-mail e formulário de contato.' },
];

const journeys = [
  { icon: HomeIcon, title: 'Quero comprar', text: 'Casas, apartamentos e terrenos para venda em Itaúna e região.', cta: 'Ver imóveis à venda', to: '/comprar' },
  { icon: Key, title: 'Quero alugar', text: 'Imóveis para locação com processo descomplicado e contrato claro.', cta: 'Ver imóveis para alugar', to: '/alugar' },
  { icon: Tag, title: 'Quero anunciar', text: 'Avaliação gratuita e divulgação profissional do seu imóvel.', cta: 'Anunciar meu imóvel', to: '/anuncie' },
];

const Index = () => {
  const { data: superFeatured, isLoading: loadingSuper } = useSuperFeaturedProperty();
  const { data: featuredSale = [], isLoading: loadingSale } = useFeaturedProperties('sale');
  const { data: featuredRent = [], isLoading: loadingRent } = useFeaturedProperties('rent');
  const { data: neighborhoods = [] } = useNeighborhoods();

  const saleFiltered = featuredSale.filter(p => !p.isSuperFeatured);

  return (
    <Layout>
      <PageHead
        title="Imobiliária em Itaúna - MG"
        description="Imóveis para comprar e alugar em Itaúna e região. Casas, apartamentos, terrenos e imóveis comerciais com atendimento próximo, transparente e CRECI ativo."
        keywords="imobiliária Itaúna, imóveis Itaúna MG, casas à venda Itaúna, aluguel Itaúna, apartamentos Itaúna, Líder Imóveis"
        canonical="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["RealEstateAgent", "LocalBusiness"],
          "name": COMPANY.fullName,
          "description": "Imobiliária em Itaúna e região. Compra, venda e locação de imóveis com atendimento próximo e transparente.",
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
          "image": "https://portal-lider-real.lovable.app/og-image.png",
          "areaServed": [
            { "@type": "City", "name": "Itaúna", "addressRegion": "MG", "addressCountry": "BR" },
            ...neighborhoods.map(n => ({
              "@type": "Place",
              "name": `${n.name}, Itaúna - MG`,
            })),
          ],
          "knowsAbout": [
            "Compra de imóveis em Itaúna",
            "Locação de imóveis em Itaúna",
            "Financiamento imobiliário CAIXA",
            "Avaliação de imóveis",
            ...neighborhoods.slice(0, 10).map(n => `Imóveis no bairro ${n.name}`),
          ],
        })}</script>
      </Helmet>

      {/* ─── Hero ─── */}
      <section
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/65" />
        <div className="container mx-auto px-4 relative z-10 py-10 sm:py-16 md:py-24">
          <motion.div
            className="text-center mb-6 sm:mb-8 md:mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-white mb-2 sm:mb-3 leading-tight">
              Imóveis para comprar e alugar<br className="hidden sm:block" /> em Itaúna e região
            </h1>
            <p className="text-white/80 text-sm sm:text-lg max-w-xl mx-auto">
              Atendimento local, transparente e ágil — do primeiro contato à entrega das chaves.
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

      {/* ─── Trust strip ─── */}
      <TrustStrip />

      {/* ─── Quick actions ─── */}
      <section className="py-5 sm:py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              { icon: Phone, label: 'Falar com especialista', path: '/contato' },
              { icon: Building2, label: 'Anunciar meu imóvel', path: '/anuncie' },
            ].map((s) => (
              <Link
                key={s.label}
                to={s.path}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <s.icon className="h-3.5 w-3.5 text-primary" />
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
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground">Imóveis à venda em Itaúna</h2>
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
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground">Imóveis para alugar em Itaúna</h2>
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

      {/* ─── How it works ─── */}
      <div className="bg-secondary/30">
        <HowItWorks />
      </div>

      {/* ─── Neighborhoods ─── */}
      <NeighborhoodsGrid />

      {/* ─── Journeys ─── */}
      <section className="py-12 md:py-16 bg-secondary/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">
              Por onde você quer começar?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Cada jornada tem um caminho. Escolha o seu e fale com nossa equipe.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {journeys.map((j) => (
              <div key={j.title} className="bg-card border border-border rounded-lg p-6 text-center flex flex-col">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                  <j.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="font-sans font-semibold text-foreground text-base mb-1.5">{j.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{j.text}</p>
                <Link to={j.to}>
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    {j.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Simulador CAIXA ─── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">Simule seu financiamento</h2>
          <p className="text-muted-foreground mb-5 text-sm sm:text-base">Use o simulador oficial da CAIXA para calcular parcelas e condições do seu financiamento imobiliário.</p>
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

      {/* ─── FAQ ─── */}
      <FaqSection items={homeFaq} subtitle="Tire as principais dúvidas antes de comprar, alugar ou anunciar com a Líder Imóveis." />

      {/* ─── CTA Capture ─── */}
      <section className="py-14 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-xl md:text-2xl font-sans font-semibold mb-3">Tem um imóvel para vender ou alugar em Itaúna?</h2>
          <p className="text-primary-foreground/80 mb-6 text-sm sm:text-base">Avaliação gratuita, divulgação profissional e equipe dedicada para encontrar o comprador ou inquilino certo.</p>
          <Link to="/anuncie">
            <Button variant="secondary" size="lg" className="gap-2 text-sm sm:text-base">
              <Building2 className="h-5 w-5" /> Anunciar meu imóvel
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
