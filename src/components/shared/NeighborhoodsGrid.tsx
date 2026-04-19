import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { NEIGHBORHOODS } from '@/data/constants';

interface NeighborhoodsGridProps {
  purpose?: 'sale' | 'rent';
  title?: string;
  subtitle?: string;
}

const NeighborhoodsGrid = ({
  purpose = 'sale',
  title = 'Bairros atendidos em Itaúna',
  subtitle = 'Conhecemos a fundo cada região da cidade para indicar o imóvel certo para você.',
}: NeighborhoodsGridProps) => {
  const basePath = purpose === 'sale' ? '/comprar' : '/alugar';

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-4xl mx-auto">
          {NEIGHBORHOODS.map((n) => (
            <li key={n}>
              <Link
                to={`${basePath}?bairro=${encodeURIComponent(n)}`}
                className="group flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border rounded-lg hover:border-primary/40 hover:bg-secondary/50 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-medium text-foreground truncate">{n}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NeighborhoodsGrid;
