import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home } from 'lucide-react';

const AccessDenied = () => (
  <Layout>
    <PageHead title="Acesso Negado" description="Você não tem permissão para acessar esta página." />
    <div className="container mx-auto px-4 py-24 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-6" />
      <h1 className="text-3xl font-sans font-bold text-foreground mb-4">Acesso negado</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Você não possui permissão para acessar esta página. Se acredita que isso é um erro, entre em contato com o administrador.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" /> Página inicial
          </Button>
        </Link>
        <Link to="/contato">
          <Button>Entrar em contato</Button>
        </Link>
      </div>
    </div>
  </Layout>
);

export default AccessDenied;
