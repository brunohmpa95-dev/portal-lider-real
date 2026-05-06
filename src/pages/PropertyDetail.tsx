import { useParams, Link } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bed, Bath, Car, Maximize2, MapPin, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/shared/BreadcrumbsJsonLd';
import PropertyCard from '@/components/property/PropertyCard';
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
import { FormattedDescription } from '@/lib/format-description';

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
  const [imgIdx, setImgIdx] = useState(0);
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
            <div className="relative rounded-lg overflow-hidden mb-3 aspect-[4/3] sm:aspect-[16/10] w-full">
              {property.images.length > 0 ? (
                <img
                  src={property.images[imgIdx]}
                  alt={property.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(imgIdx)}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Sem fotos disponíveis</p>
                </div>
              )}
              {property.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => i > 0 ? i - 1 : property.images.length - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/60 transition-colors" aria-label="Anterior">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setImgIdx(i => i < property.images.length - 1 ? i + 1 : 0)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/60 transition-colors" aria-label="Próxima">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-2 right-2 text-xs text-white/90 bg-black/50 backdrop-blur-sm rounded px-2 py-1 font-mono">
                    {imgIdx + 1}/{property.images.length}
                  </span>
                </>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                {property.isNew && <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold">Novo</Badge>}
              </div>
              <span className="absolute top-3 right-3 text-[10px] font-mono text-white/80 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
                {property.code}
              </span>
            </div>

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-thin">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    onDoubleClick={() => openLightbox(i)}
                    className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-primary' : 'border-transparent hover:border-border'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* ─── Price + title block ─── */}
            <div className="mb-5">
              <p className="text-primary font-bold text-2xl sm:text-3xl mb-1.5">
                {formatPrice(property.price, property.purpose)}
              </p>
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

            {/* ─── Mobile WhatsApp CTA ─── */}
            {isMobile && (
              <WhatsAppCTA
                intent={intent}
                propertyId={property.id}
                propertyCode={property.code}
                propertyTitle={property.title}
                neighborhood={property.neighborhood}
                source="property-detail-mobile"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-medium hover:bg-[#20BD5A] transition-colors mb-6"
              >
                <MessageCircle className="h-5 w-5" /> {intent === 'buy' ? 'Quero comprar — chamar no WhatsApp' : 'Quero alugar — chamar no WhatsApp'}
              </WhatsAppCTA>
            )}

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
