import { useParams, Link } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bed, Bath, Car, Maximize2, MapPin, MessageCircle, ArrowLeft, Loader2, Expand } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/shared/BreadcrumbsJsonLd';
import PropertyCard from '@/components/property/PropertyCard';
import CardImageCarousel from '@/components/property/CardImageCarousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { useProperty, useSimilarProperties } from '@/hooks/useProperties';
import { formatPrice } from '@/data/properties';
import { submitForm } from '@/lib/form-submit';
import { useToast } from '@/hooks/use-toast';
import WhatsAppCTA from '@/components/shared/WhatsAppCTA';
import ShareButton from '@/components/shared/ShareButton';
import { FormattedDescription } from '@/lib/format-description';

const SITE_URL = 'https://portal-lider-real.lovable.app';

/* ─── Attribute pill ─── */
const AttrCard = ({ icon: Icon, value, label }: { icon: any; value: string | number; label: string }) => (
  <div className="flex flex-col items-center justify-center text-center bg-secondary/80 rounded-lg py-3 px-2 min-w-0 break-words">
    <Icon className="h-4 w-4 text-primary mb-1 shrink-0" />
    <p className="font-semibold text-foreground text-sm leading-tight break-words max-w-full">{value}</p>
    <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
  </div>
);

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, isError } = useProperty(id || '');
  const { data: similar = [] } = useSimilarProperties(property ?? null);
  // (galeria agora usa CardImageCarousel; lightbox controla seu próprio índice)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  }, []);

  /* ─── Loading state ─── */
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-5 w-40 mb-6" />
          <Skeleton className="aspect-[16/10] w-full rounded-lg mb-4" />
          <Skeleton className="h-7 w-2/3 mb-2" />
          <Skeleton className="h-5 w-1/3 mb-4" />
          <Skeleton className="h-9 w-1/4" />
        </div>
      </Layout>
    );
  }

  /* ─── Error state ─── */
  if (isError || !property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-sans font-bold mb-4">Imóvel não encontrado</h1>
          <p className="text-muted-foreground mb-4">Este imóvel pode ter sido removido ou não está mais disponível.</p>
          <Link to="/comprar"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast({ title: "Consentimento necessário", description: "Você precisa concordar com a política de privacidade.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitForm('property_lead', {
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        message: fd.get('message'),
        property_id: property.id,
      });
      setFormSuccess(true);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const intent = property.purpose === 'sale' ? 'buy' : 'rent';
  const canonicalUrl = `${SITE_URL}/imovel/${property.id}`;
  // URL compartilhada aponta para a edge function que entrega Open Graph rico
  // a crawlers (WhatsApp/Facebook/etc.) e redireciona humanos para o imóvel.
  const shareUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-property?id=${property.id}`;
  const shareTitle = `${property.title} — ${formatPrice(property.price, property.purpose)}`;
  const shareDesc = `${property.neighborhood}, ${property.city}/${property.state} · ${property.bedrooms ? `${property.bedrooms} quarto(s) · ` : ''}${property.area}m²`;
  const ogImage = property.images?.[0];

  return (
    <Layout>
      <PageHead
        title={property.title}
        description={`${property.title} - ${property.neighborhood}, ${property.city}. ${formatPrice(property.price, property.purpose)}`}
        canonical={`/imovel/${property.id}`}
      />
      <BreadcrumbsJsonLd items={[
        { name: property.purpose === 'sale' ? 'Comprar' : 'Alugar', path: property.purpose === 'sale' ? '/comprar' : '/alugar' },
        { name: property.title, path: `/imovel/${property.id}` },
      ]} />
      <Helmet>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDesc} />
        <meta property="og:url" content={shareUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDesc} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": property.title,
          "description": property.description || '',
          "url": `https://portal-lider-real.lovable.app/imovel/${property.id}`,
          "datePosted": property.createdAt,
          "image": property.images.length > 0 ? property.images : undefined,
          "offers": {
            "@type": "Offer",
            "price": property.price,
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": property.city,
            "addressRegion": property.state,
            "streetAddress": property.address || property.neighborhood
          },
          "floorSize": { "@type": "QuantitativeValue", "value": property.area, "unitCode": "MTK" },
          "numberOfRooms": property.bedrooms,
          "numberOfBathroomsTotal": property.bathrooms
        })}</script>
      </Helmet>

      <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden pb-24 md:pb-12">
        <Breadcrumbs items={[
          { label: property.purpose === 'sale' ? 'Comprar' : 'Alugar', path: property.purpose === 'sale' ? '/comprar' : '/alugar' },
          { label: property.title },
        ]} />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16 w-full min-w-0">
          {/* ─── Main column ─── */}
          <div className="lg:col-span-2 min-w-0 w-full">
            {/* Gallery */}
            <div className="relative rounded-lg overflow-hidden mb-3 aspect-[4/3] sm:aspect-[16/10] w-full bg-muted">
              {property.images.length > 0 ? (
                <CardImageCarousel
                  images={property.images}
                  alt={property.title}
                  className="w-full h-full"
                  arrowSize="md"
                  showIndicators={false}
                >
                  {/* Click overlay to open lightbox */}
                  <button
                    type="button"
                    aria-label="Ampliar fotos"
                    onClick={() => openLightbox(0)}
                    className="absolute inset-0 z-0"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10 pointer-events-none">
                    {property.isNew && <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold">Novo</Badge>}
                  </div>
                  <span className="absolute top-3 right-3 text-[10px] font-mono text-white/90 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5 z-10 pointer-events-none">
                    {property.code}
                  </span>
                  {/* Expand button — visible on touch */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openLightbox(0); }}
                    aria-label="Ver fotos em tela cheia"
                    className="absolute bottom-3 right-3 z-20 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <Expand className="h-4 w-4" />
                  </button>
                  {property.images.length > 1 && (
                    <span className="absolute bottom-3 left-3 z-20 text-xs text-white/90 bg-black/50 backdrop-blur-sm rounded px-2 py-1 font-mono pointer-events-none">
                      {property.images.length} fotos
                    </span>
                  )}
                </CardImageCarousel>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Sem fotos disponíveis</p>
                </div>
              )}
            </div>

            {/* Thumbnails — tap opens lightbox at that index */}
            {property.images.length > 1 && (
              <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-thin">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openLightbox(i)}
                    aria-label={`Abrir foto ${i + 1}`}
                    className="shrink-0 w-20 h-16 sm:w-24 sm:h-16 rounded overflow-hidden border-2 border-transparent hover:border-primary/60 transition-colors"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* ─── Price + title block ─── */}
            <div className="mb-5">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <p className="text-primary font-bold text-2xl sm:text-3xl">
                  {formatPrice(property.price, property.purpose)}
                </p>
                <ShareButton
                  url={shareUrl}
                  title={shareTitle}
                  description={shareDesc}
                  className="shrink-0"
                />
              </div>
              {(property.condominiumFee || property.iptu) && (
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                  {property.condominiumFee ? <span>Cond. {property.condominiumFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> : null}
                  {property.iptu ? <span>IPTU {property.iptu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> : null}
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-sans font-bold text-foreground mb-1.5">{property.title}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />{property.neighborhood} · {property.city} - {property.state}
              </p>
            </div>

            {/* ─── Attributes grid ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
              {property.bedrooms > 0 && <AttrCard icon={Bed} value={property.bedrooms} label="Quartos" />}
              {property.suites > 0 && <AttrCard icon={Bed} value={property.suites} label="Suítes" />}
              {property.bathrooms > 0 && <AttrCard icon={Bath} value={property.bathrooms} label="Banheiros" />}
              {property.parkingSpots > 0 && <AttrCard icon={Car} value={property.parkingSpots} label="Vagas" />}
              <AttrCard icon={Maximize2} value={`${property.area}m²`} label="Área" />
            </div>

            {/* Mobile inline CTA removed — substituído pela sticky bottom bar */}

            {/* ─── Description ─── */}
            {property.description && (
              <div className="mb-6">
                <h2 className="font-sans text-base font-semibold text-foreground mb-2">Descrição</h2>
                <FormattedDescription
                  text={property.description}
                  headingStyle={(property as any).description_heading_style ?? 'soft'}
                />
              </div>
            )}

            {/* ─── Features ─── */}
            {property.features.length > 0 && (
              <div className="mb-6">
                <h2 className="font-sans text-base font-semibold text-foreground mb-2">Características</h2>
                <div className="flex flex-wrap gap-1.5">
                  {property.features.map(f => (
                    <Badge key={f} variant="secondary" className="text-xs font-normal">{f}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Sidebar ─── */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className="lg:sticky lg:top-24 space-y-4 w-full min-w-0">
              {/* Lead form */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-5 w-full max-w-full min-w-0 overflow-hidden">
                <h2 className="font-sans font-semibold text-foreground text-sm mb-1">Fale com um especialista</h2>
                <p className="text-[11px] text-muted-foreground mb-3">
                  {intent === 'buy'
                    ? 'Tire dúvidas, agende uma visita ou faça uma proposta para este imóvel.'
                    : 'Tire dúvidas sobre valores, garantias e agende uma visita.'}
                </p>
                {formSuccess ? (
                  <div className="text-center py-5">
                    <p className="text-primary font-semibold mb-1">Mensagem enviada!</p>
                    <p className="text-xs text-muted-foreground">Em breve entraremos em contato.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-2.5 w-full min-w-0">
                    {/* Honeypot antispam — invisível para usuários reais */}
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
                    <Input name="name" placeholder="Seu nome" required minLength={2} maxLength={100} className="h-11 text-base sm:h-10 sm:text-sm w-full min-w-0" />
                    <Input name="email" placeholder="E-mail" type="email" required maxLength={255} className="h-11 text-base sm:h-10 sm:text-sm w-full min-w-0" />
                    <Input name="phone" placeholder="Telefone / WhatsApp" maxLength={20} className="h-11 text-base sm:h-10 sm:text-sm w-full min-w-0" />
                    <Textarea name="message" placeholder="Conte o que quer saber (opcional)" rows={2} maxLength={1000} className="resize-none text-base sm:text-sm w-full min-w-0" />
                    <div className="flex items-start gap-2">
                      <Checkbox id="consent-lead" checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
                      <label htmlFor="consent-lead" className="text-[11px] text-muted-foreground leading-tight">
                        Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link>.
                      </label>
                    </div>
                    <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar mensagem'}
                    </Button>
                  </form>
                )}
              </div>

              {/* WhatsApp — desktop only (mobile has inline CTA above) */}
              {!isMobile && (
                <div className="space-y-2">
                  <WhatsAppCTA
                    intent={intent}
                    propertyId={property.id}
                    propertyCode={property.code}
                    propertyTitle={property.title}
                    neighborhood={property.neighborhood}
                    source="property-detail-sidebar"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-medium hover:bg-[#20BD5A] transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" /> {intent === 'buy' ? 'Quero comprar — WhatsApp' : 'Quero alugar — WhatsApp'}
                  </WhatsAppCTA>
                  <WhatsAppCTA
                    intent="visit"
                    propertyId={property.id}
                    propertyCode={property.code}
                    propertyTitle={property.title}
                    neighborhood={property.neighborhood}
                    source="property-detail-visit"
                    className="flex items-center justify-center gap-2 w-full border border-border bg-background py-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Agendar visita pelo WhatsApp
                  </WhatsAppCTA>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Similar ─── */}
        {similar.length > 0 && (
          <section className="mb-12 lg:mb-16">
            <h2 className="text-lg sm:text-xl font-sans font-semibold text-foreground mb-5">Imóveis Semelhantes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* ─── Sticky bottom bar (mobile) — Preço + WhatsApp ─── */}
      {isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-3 py-2 flex items-center gap-2 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
              {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
            </p>
            <p className="text-primary font-bold text-base leading-tight truncate">
              {formatPrice(property.price, property.purpose)}
            </p>
          </div>
          <WhatsAppCTA
            intent={intent}
            propertyId={property.id}
            propertyCode={property.code}
            propertyTitle={property.title}
            neighborhood={property.neighborhood}
            source="property-detail-sticky"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 h-11 rounded-lg font-medium text-sm hover:bg-[#20BD5A] transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </WhatsAppCTA>
        </div>
      )}

      {/* ─── Lightbox ─── */}
      {property.images.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className={`p-0 border-none bg-black/95 flex flex-col items-center justify-center [&>button]:text-white [&>button]:hover:text-white/80 ${isMobile ? 'w-screen h-screen max-w-none rounded-none' : 'max-w-5xl w-[95vw] h-[90vh]'}`}>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-mono z-10">
              {currentSlide + 1} / {property.images.length}
            </div>
            <Carousel opts={{ startIndex: lightboxIdx, loop: true }} setApi={setCarouselApi} className="w-full h-full flex items-center">
              <CarouselContent className="h-full">
                {property.images.map((img, i) => (
                  <CarouselItem key={i} className="flex items-center justify-center h-full">
                    <img src={img} alt={`${property.title} - Foto ${i + 1}`} className="max-w-full max-h-[80vh] object-contain select-none" loading="lazy" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 sm:left-4 bg-white/10 border-none text-white hover:bg-white/20 hover:text-white h-12 w-12 sm:h-10 sm:w-10" />
              <CarouselNext className="right-2 sm:right-4 bg-white/10 border-none text-white hover:bg-white/20 hover:text-white h-12 w-12 sm:h-10 sm:w-10" />
            </Carousel>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default PropertyDetail;
