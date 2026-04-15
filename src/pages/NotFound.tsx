import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

const NotFound = () => (
  <Layout>
    <PageHead title="Página não encontrada" description="A página que você procura não existe ou foi removida." />
    <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
      <p className="text-5xl sm:text-6xl font-sans font-bold text-foreground mb-2">404</p>
      <p className="text-base text-muted-foreground mb-6">Página não encontrada</p>
      <p className="text-xs text-muted-foreground mb-8 max-w-xs mx-auto">A página que você procura não existe, foi removida ou está temporariamente indisponível.</p>
      <div className="flex items-center justify-center gap-2.5">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-1.5"><Home className="h-3.5 w-3.5" /> Início</Button>
        </Link>
        <Link to="/comprar">
          <Button size="sm" className="gap-1.5"><Search className="h-3.5 w-3.5" /> Ver imóveis</Button>
        </Link>
      </div>
    </div>
  </Layout>
);

export default NotFound;
