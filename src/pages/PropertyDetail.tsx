import { useParams, Link } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bed, Bath, Car, Maximize2, MapPin, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
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
import { COMPANY } from '@/data/constants';
import { submitForm } from '@/lib/form-submit';
import { useToast } from '@/hooks/use-toast';

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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-[16/10] w-full rounded-lg" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-1/4" />
            </div>
            <div>
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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

  return (
    <Layout>
      <PageHead title={property.title} description={`${property.title} - ${property.neighborhood}, ${property.city}. ${formatPrice(property.price, property.purpose)}`} />
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
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": property.area,
            "unitCode": "MTK"
          },
          "numberOfRooms": property.bedrooms,
          "numberOfBathroomsTotal": property.bathrooms
        })}</script>
      </Helmet>
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[
          { label: property.purpose === 'sale' ? 'Comprar' : 'Alugar', path: property.purpose === 'sale' ? '/comprar' : '/alugar' },
          { label: property.title },
        ]} />

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="relative rounded-lg overflow-hidden mb-6 aspect-[16/10]">
              {property.images.length > 0 ? (
                <img src={property.images[imgIdx]} alt={property.title} className="w-full h-full object-cover cursor-pointer" onClick={() => openLightbox(imgIdx)} />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Sem fotos disponíveis</p>
                </div>
              )}
              {property.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => i > 0 ? i - 1 : property.images.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors" aria-label="Anterior">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setImgIdx(i => i < property.images.length - 1 ? i + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors" aria-label="Próxima">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {property.isNew && <Badge className="bg-primary text-primary-foreground">Novo</Badge>}
                <Badge variant="outline" className="bg-background/90 backdrop-blur-sm font-mono">{property.code}</Badge>
              </div>
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {property.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} onDoubleClick={() => openLightbox(i)} className={`shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors cursor-pointer ${i === imgIdx ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-sans font-bold text-foreground mb-2">{property.title}</h1>
            <p className="flex items-center gap-1.5 text-muted-foreground mb-4"><MapPin className="h-4 w-4" />{property.neighborhood} · {property.city} - {property.state}</p>
            <p className="text-primary text-3xl font-semibold mb-6">{formatPrice(property.price, property.purpose)}</p>

            {(property.condominiumFee || property.iptu) && (
              <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                {property.condominiumFee ? <span>Condomínio: {property.condominiumFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> : null}
                {property.iptu ? <span>IPTU: {property.iptu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> : null}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {property.bedrooms > 0 && <div className="bg-secondary rounded-lg p-4 text-center"><Bed className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="font-semibold text-foreground">{property.bedrooms}</p><p className="text-xs text-muted-foreground">Quartos</p></div>}
              {property.suites > 0 && <div className="bg-secondary rounded-lg p-4 text-center"><Bed className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="font-semibold text-foreground">{property.suites}</p><p className="text-xs text-muted-foreground">Suítes</p></div>}
              {property.bathrooms > 0 && <div className="bg-secondary rounded-lg p-4 text-center"><Bath className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="font-semibold text-foreground">{property.bathrooms}</p><p className="text-xs text-muted-foreground">Banheiros</p></div>}
              {property.parkingSpots > 0 && <div className="bg-secondary rounded-lg p-4 text-center"><Car className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="font-semibold text-foreground">{property.parkingSpots}</p><p className="text-xs text-muted-foreground">Vagas</p></div>}
              <div className="bg-secondary rounded-lg p-4 text-center"><Maximize2 className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="font-semibold text-foreground">{property.area}m²</p><p className="text-xs text-muted-foreground">Área</p></div>
            </div>

            <h2 className="font-sans text-lg font-semibold text-foreground mb-3">Descrição</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{property.description}</p>

            {property.features.length > 0 && (
              <>
                <h2 className="font-sans text-lg font-semibold text-foreground mb-3">Características</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {property.features.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-sans font-semibold text-foreground mb-4">Tenho interesse neste imóvel</h3>
                {formSuccess ? (
                  <div className="text-center py-6">
                    <p className="text-primary font-semibold mb-2">Mensagem enviada!</p>
                    <p className="text-sm text-muted-foreground">Em breve nossa equipe entrará em contato.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input name="name" placeholder="Seu nome" required minLength={2} maxLength={100} />
                    <Input name="email" placeholder="E-mail" type="email" required maxLength={255} />
                    <Input name="phone" placeholder="Telefone" maxLength={20} />
                    <Textarea name="message" placeholder="Mensagem" rows={3} maxLength={1000} />

                    <div className="flex items-start gap-2">
                      <Checkbox id="consent-lead" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                      <label htmlFor="consent-lead" className="text-[11px] text-muted-foreground leading-tight">
                        Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link>.
                      </label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar mensagem'}
                    </Button>
                  </form>
                )}
              </div>

              <a
                href={`${COMPANY.whatsappLink}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel ${property.code} - ${property.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-medium hover:bg-[#20BD5A] transition-colors"
              >
                <MessageCircle className="h-5 w-5" /> Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-sans font-semibold text-foreground mb-6">Imóveis Semelhantes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox Gallery */}
      {property.images.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className={`p-0 border-none bg-black/95 flex flex-col items-center justify-center [&>button]:text-white [&>button]:hover:text-white/80 ${isMobile ? 'w-screen h-screen max-w-none rounded-none' : 'max-w-5xl w-[95vw] h-[90vh]'}`}>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-mono z-10">
              {currentSlide + 1} / {property.images.length}
            </div>
            <Carousel
              opts={{ startIndex: lightboxIdx, loop: true }}
              setApi={setCarouselApi}
              className="w-full h-full flex items-center"
            >
              <CarouselContent className="h-full">
                {property.images.map((img, i) => (
                  <CarouselItem key={i} className="flex items-center justify-center h-full">
                    <img
                      src={img}
                      alt={`${property.title} - Foto ${i + 1}`}
                      className="max-w-full max-h-[80vh] object-contain select-none"
                      loading="lazy"
                    />
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
