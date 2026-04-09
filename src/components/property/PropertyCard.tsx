import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bed, Bath, Car, Maximize2, ArrowRight } from 'lucide-react';
import { Property } from '@/data/types';
import { formatPrice } from '@/data/properties';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard = ({ property, index = 0 }: PropertyCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    whileHover={{ y: -6 }}
  >
    <Link
      to={`/imovel/${property.id}`}
      className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          {property.isNew && <Badge className="bg-primary text-primary-foreground text-xs">Novo</Badge>}
          {property.isFeatured && <Badge variant="secondary" className="text-xs">Destaque</Badge>}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-xs font-mono">
            {property.code}
          </Badge>
        </div>
        {/* "Ver detalhes" indicator */}
        <div className="absolute bottom-14 right-3 z-10 flex items-center gap-1 text-xs font-medium text-white bg-primary/80 backdrop-blur-sm rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Ver detalhes <ArrowRight className="h-3 w-3" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 group-hover:from-black/70 to-transparent p-4 transition-colors duration-300">
          <p className="text-white font-semibold text-lg">
            {formatPrice(property.price, property.purpose)}
          </p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-sans font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {property.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {property.neighborhood} · {property.city}
        </p>
        {property.type !== 'terreno' && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms}</span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms}</span>
            )}
            {property.parkingSpots > 0 && (
              <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{property.parkingSpots}</span>
            )}
            <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{property.area}m²</span>
          </div>
        )}
        {property.type === 'terreno' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Maximize2 className="h-3.5 w-3.5" />{property.area}m²
          </div>
        )}
      </div>
    </Link>
  </motion.div>
);

export default PropertyCard;
