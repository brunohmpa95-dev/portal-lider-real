import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bed, Bath, Car, Maximize2 } from 'lucide-react';
import { Property } from '@/data/types';
import CardImageCarousel from './CardImageCarousel';
import { formatPrice } from '@/data/properties';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard = ({ property, index = 0 }: PropertyCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
  >
    <Link
      to={`/imovel/${property.id}`}
      className="group flex flex-col bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full"
    >
      {/* Image */}
      <CardImageCarousel
        images={property.images}
        alt={property.title}
        className="aspect-[16/10]"
        imgClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
          {property.isNew && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-semibold">Novo</Badge>
          )}
          {property.isSuperFeatured && (
            <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 font-semibold">Destaque</Badge>
          )}
        </div>

        {/* Code — top right */}
        <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/80 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5 z-10">
          {property.code}
        </span>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 z-10 pointer-events-none">
          <p className="text-white font-bold text-lg leading-tight">
            {formatPrice(property.price, property.purpose)}
          </p>
        </div>
      </CardImageCarousel>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="font-sans font-semibold text-foreground text-sm leading-snug line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {property.neighborhood} · {property.city}
        </p>

        {/* Attributes */}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1" title="Quartos"><Bed className="h-3.5 w-3.5 text-primary/70" />{property.bedrooms}</span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1" title="Banheiros"><Bath className="h-3.5 w-3.5 text-primary/70" />{property.bathrooms}</span>
          )}
          {property.parkingSpots > 0 && (
            <span className="flex items-center gap-1" title="Vagas"><Car className="h-3.5 w-3.5 text-primary/70" />{property.parkingSpots}</span>
          )}
          <span className="flex items-center gap-1 ml-auto" title="Área"><Maximize2 className="h-3.5 w-3.5 text-primary/70" />{property.area}m²</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default PropertyCard;
