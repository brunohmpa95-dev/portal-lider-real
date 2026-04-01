import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => (
  <Layout>
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-sans font-bold text-foreground mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Página não encontrada</p>
      <Link to="/">
        <Button className="gap-2"><Home className="h-4 w-4" /> Voltar ao início</Button>
      </Link>
    </div>
  </Layout>
);

export default NotFound;
