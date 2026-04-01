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
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="grid md:grid-cols-2 gap-0">
      <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground">Super Destaque</Badge>
        </div>
      </div>
      <div className="p-6 md:p-8 flex flex-col justify-center">
        <p className="text-xs text-muted-foreground font-mono mb-2">{property.code}</p>
        <h2 className="font-sans text-2xl md:text-3xl font-semibold text-foreground mb-2">
          {property.title}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          {property.neighborhood} · {property.city} - {property.state}
        </p>
        <p className="text-primary font-semibold text-2xl mb-6">
          {formatPrice(property.price, property.purpose)}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{property.bedrooms} quartos</span>
          )}
          {property.suites > 0 && (
            <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{property.suites} suítes</span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{property.bathrooms} banheiros</span>
          )}
          {property.parkingSpots > 0 && (
            <span className="flex items-center gap-1.5"><Car className="h-4 w-4" />{property.parkingSpots} vagas</span>
          )}
          <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4" />{property.area}m²</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/imovel/${property.id}`}>
            <Button className="gap-2 w-full sm:w-auto">
              Ver detalhes <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={`${COMPANY.whatsappLink}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel ${property.code} - ${property.title}`)}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  </motion.div>
);

export default PremiumPropertyCard;
