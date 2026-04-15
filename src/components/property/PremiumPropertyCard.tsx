import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bed, Bath, Car, Maximize2, ArrowRight, MessageCircle } from 'lucide-react';
import { Property } from '@/data/types';
import { formatPrice } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COMPANY } from '@/data/constants';

interface PremiumPropertyCardProps {
  property: Property;
}

const PremiumPropertyCard = ({ property }: PremiumPropertyCardProps) => (
  <motion.div
    className="bg-card rounded-lg border border-border overflow-hidden"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <div className="grid md:grid-cols-2 gap-0">
      {/* Image */}
      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <Badge className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold">
          Super Destaque
        </Badge>
      </div>

      {/* Info */}
      <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-center">
        <span className="text-[11px] text-muted-foreground font-mono mb-1.5">{property.code}</span>
        <h2 className="font-sans text-xl sm:text-2xl font-semibold text-foreground mb-1.5 leading-tight">
          {property.title}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          {property.neighborhood} · {property.city} - {property.state}
        </p>
        <p className="text-primary font-bold text-2xl mb-5">
          {formatPrice(property.price, property.purpose)}
        </p>

        {/* Attributes */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-6">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-primary/70" />{property.bedrooms} quartos</span>
          )}
          {property.suites > 0 && (
            <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-primary/70" />{property.suites} suítes</span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary/70" />{property.bathrooms} ban.</span>
          )}
          {property.parkingSpots > 0 && (
            <span className="flex items-center gap-1.5"><Car className="h-4 w-4 text-primary/70" />{property.parkingSpots} vagas</span>
          )}
          <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4 text-primary/70" />{property.area}m²</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link to={`/imovel/${property.id}`} className="flex-1">
            <Button className="gap-2 w-full">
              Ver detalhes <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href={`${COMPANY.whatsappLink}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel ${property.code} - ${property.title}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" className="gap-2 w-full">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  </motion.div>
);

export default PremiumPropertyCard;
