import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Headphones, DollarSign, Home, LayoutDashboard, LogOut, Shield, LogIn } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/data/constants';
import { ROLE_LABELS } from '@/lib/auth-types';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Painel', path: '/cliente' },
  { icon: FileText, label: 'Contratos', path: '/cliente/contratos' },
  { icon: FileText, label: 'Documentos', path: '/cliente/documentos' },
  { icon: DollarSign, label: 'Financeiro', path: '/cliente/financeiro' },
  { icon: Headphones, label: 'Atendimento', path: '/cliente/atendimento' },
  { icon: Home, label: 'Imóveis', path: '/cliente/imoveis' },
];

interface ClientLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const ClientLayout = ({ children, title = 'Área do Cliente', description }: ClientLayoutProps) => {
  const { user, profile, roles, signOut } = useAuth();
  const location = useLocation();

  return (
    <Layout>
      <PageHead title={title} description={description || 'Acesse a Área do Cliente da Líder Imóveis.'} />
      <div className="min-h-[80vh] bg-surface-sunken">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
            {/* Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
              {/* User card */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <p className="font-sans font-bold text-foreground text-sm truncate">
                  {profile?.full_name || 'Cliente'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {roles.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground">
                      {roles.map(r => ROLE_LABELS[r]).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="bg-card border border-border rounded-lg overflow-hidden">
                {menuItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-border last:border-b-0',
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* External system link */}
              <a
                href={COMPANY.systemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 mt-4 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                Acessar Sistema Principal
              </a>

              {/* Sign out */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="w-full mt-2 gap-1.5 text-xs text-muted-foreground justify-start"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair da conta
              </Button>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientLayout;
