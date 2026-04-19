import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { Skeleton } from '@/components/ui/skeleton';

interface NeighborhoodsGridProps {
  purpose?: 'sale' | 'rent';
  title?: string;
  subtitle?: string;
  /** If true, only shows verified neighborhoods (default true for public site SEO). */
  verifiedOnly?: boolean;
}

const NeighborhoodsGrid = ({
  purpose = 'sale',
  title = 'Bairros atendidos em Itaúna',
  subtitle = 'Conhecemos a fundo cada região da cidade para indicar o imóvel certo para você.',
  verifiedOnly = true,
}: NeighborhoodsGridProps) => {
  const basePath = purpose === 'sale' ? '/comprar' : '/alugar';
  const { data: neighborhoods, isLoading } = useNeighborhoods();

  const list = (neighborhoods ?? []).filter((n) => (verifiedOnly ? n.verified : true));
  // Cap at a reasonable visible count for the home grid
  const visible = list.slice(0, 16);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
        </div>

        {isLoading ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-4xl mx-auto">
            {Array.from({ length: 12 }).map((_, i) => (
              <li key={i}><Skeleton className="h-10 w-full rounded-lg" /></li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-4xl mx-auto">
            {visible.map((n) => (
              <li key={n.id}>
                <Link
                  to={`${basePath}?bairro=${encodeURIComponent(n.name)}`}
                  className="group flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border rounded-lg hover:border-primary/40 hover:bg-secondary/50 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">{n.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default NeighborhoodsGrid;
