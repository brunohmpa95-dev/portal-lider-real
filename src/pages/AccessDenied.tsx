import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home } from 'lucide-react';

const AccessDenied = () => (
  <Layout>
    <PageHead title="Acesso Negado" description="Você não tem permissão para acessar esta página." />
    <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-sans font-bold text-foreground mb-2">Acesso negado</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Você não possui permissão para acessar esta página. Se acredita que isso é um erro, entre em contato.
      </p>
      <div className="flex items-center justify-center gap-2.5">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-1.5"><Home className="h-3.5 w-3.5" /> Início</Button>
        </Link>
        <Link to="/contato">
          <Button size="sm">Entrar em contato</Button>
        </Link>
      </div>
    </div>
  </Layout>
);

export default AccessDenied;
