import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav aria-label="Navegação" className="flex items-center gap-1.5 text-sm text-muted-foreground py-4">
    <Link to="/" className="hover:text-primary transition-colors">Início</Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1.5">
        <ChevronRight className="h-3.5 w-3.5" />
        {item.path ? (
          <Link to={item.path} className="hover:text-primary transition-colors">{item.label}</Link>
        ) : (
          <span className="text-foreground font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumbs;
