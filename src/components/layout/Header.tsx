import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_ACCESS_ROLES } from '@/lib/admin-nav';
import logoImg from '@/assets/logo-transparent.png';

const navItems = [
  { label: 'Comprar', path: '/comprar' },
  { label: 'Alugar', path: '/alugar' },
  { label: 'Sobre', path: '/sobre' },
  { label: 'Anuncie', path: '/anuncie' },
  { label: 'Contato', path: '/contato' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, profile, signOut, hasAnyRole } = useAuth();
  const showAdminLink = isAuthenticated && hasAnyRole(ADMIN_ACCESS_ROLES);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 h-16 sm:h-[72px]">
        <Link to="/" className="flex items-center shrink-0" aria-label="Página inicial">
          <img src={logoImg} alt="Líder Imóveis Itaúna" className="h-11 sm:h-14 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'text-primary bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-1.5">
          {showAdminLink && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                <Settings className="h-3.5 w-3.5" /> Admin
              </Button>
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <Link to="/area-do-cliente">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                  <User className="h-3.5 w-3.5" />
                  {profile?.full_name?.split(' ')[0] || 'Conta'}
                </Button>
              </Link>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => signOut()} aria-label="Sair">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-1.5 text-xs h-8">
                <LogIn className="h-3.5 w-3.5" /> Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 -mr-2 rounded-md hover:bg-secondary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {showAdminLink && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full gap-1.5 justify-center h-9">
                  <Settings className="h-3.5 w-3.5" /> Admin
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex gap-2 mt-1">
                <Link to="/area-do-cliente" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 justify-center h-9">
                    <User className="h-3.5 w-3.5" /> Minha conta
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-9"
                  onClick={() => { signOut(); setMobileOpen(false); }}
                >
                  <LogOut className="h-3.5 w-3.5" /> Sair
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-1">
                <Button size="sm" className="w-full gap-1.5 justify-center h-9">
                  <LogIn className="h-3.5 w-3.5" /> Entrar
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
