import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 h-20">
        <Link to="/" className="flex items-center" aria-label="Página inicial">
          <img src={logoImg} alt="Líder Imóveis Itaúna" className="h-14 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'text-primary bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/anuncie">
            <Button variant="outline" size="sm" className="gap-1.5">
              <HomeIcon className="h-4 w-4" /> Anuncie seu imóvel
            </Button>
          </Link>
          <Link to="/area-do-cliente">
            <Button size="sm" className="gap-1.5">
              <User className="h-4 w-4" /> Área do Cliente
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <Link to="/anuncie" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full gap-1.5 justify-center">
                <HomeIcon className="h-4 w-4" /> Anuncie seu imóvel
              </Button>
            </Link>
            <Link to="/area-do-cliente" onClick={() => setMobileOpen(false)}>
              <Button className="w-full gap-1.5 justify-center mt-1">
                <User className="h-4 w-4" /> Área do Cliente
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
