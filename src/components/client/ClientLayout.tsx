import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Headphones, DollarSign, Home, LayoutDashboard, LogOut, Shield, MoreVertical } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/auth-types';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Painel', shortLabel: 'Painel', path: '/cliente' },
  { icon: FileText, label: 'Contratos', shortLabel: 'Contratos', path: '/cliente/contratos' },
  { icon: FileText, label: 'Documentos', shortLabel: 'Docs', path: '/cliente/documentos' },
  { icon: DollarSign, label: 'Financeiro', shortLabel: 'Finanças', path: '/cliente/financeiro' },
  { icon: Headphones, label: 'Atendimento', shortLabel: 'Suporte', path: '/cliente/atendimento' },
  { icon: Home, label: 'Imóveis', shortLabel: 'Imóveis', path: '/cliente/imoveis' },
];

interface ClientLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const ClientLayout = ({ children, title = 'Área do Cliente', description }: ClientLayoutProps) => {
  const { user, profile, roles, signOut, signOutAllSessions } = useAuth();
  const location = useLocation();
  const initial = (profile?.full_name || user?.email || 'C').charAt(0).toUpperCase();

  return (
    <Layout>
      <PageHead title={title} description={description || 'Acesse a Área do Cliente da Líder Imóveis.'} />
      <div className="min-h-[80vh] bg-surface-sunken">
        {/* MOBILE: sticky compact header */}
        <div className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {profile?.full_name?.split(' ')[0] || 'Cliente'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">{user?.email}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" aria-label="Menu da conta">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {roles.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-primary" />
                      {roles.map(r => ROLE_LABELS[r]).join(', ')}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => signOut()} className="gap-2">
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOutAllSessions()} className="gap-2 text-muted-foreground">
                  <LogOut className="h-4 w-4" /> Sair de todas as sessões
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
          <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
            {/* DESKTOP sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
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
            <main className="flex-1 min-w-0 pb-24 md:pb-0">
              {children}
            </main>
          </div>
        </div>

        {/* MOBILE: bottom navigation */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="grid grid-cols-6">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground active:bg-accent/40'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  <span className="leading-none truncate max-w-full px-1">{item.shortLabel}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </Layout>
  );
};

export default ClientLayout;
