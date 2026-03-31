import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { COMPANY, DEPARTMENTS } from '@/data/constants';
import logoImg from '@/assets/logo-transparent.png';

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1 — Brand */}
        <div>
          <img src={logoImg} alt="Líder Imóveis" className="h-12 w-auto mb-4 brightness-0 invert" />
          <p className="text-sm text-primary-foreground/70 mb-4 leading-relaxed">
            Há mais de 15 anos conectando pessoas aos melhores imóveis de Itaúna e região.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{COMPANY.hours}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{COMPANY.address}</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Col 2 — Links */}
        <div>
          <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {[
              { label: 'Comprar', path: '/comprar' },
              { label: 'Alugar', path: '/alugar' },
              { label: 'Sobre nós', path: '/sobre' },
              { label: 'Anuncie seu imóvel', path: '/anuncie' },
              { label: 'Contato', path: '/contato' },
              { label: 'Política de Privacidade', path: '/privacidade' },
            ].map(l => (
              <li key={l.path}><Link to={l.path} className="hover:text-primary transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Acesso */}
        <div>
          <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4">Área do Cliente</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {[
              { label: 'Acessar sistema', path: '/area-do-cliente' },
              { label: 'Documentos', path: '/documentos' },
              { label: 'Ouvidoria', path: '/ouvidoria' },
              { label: 'Trabalhe conosco', path: '/trabalhe-conosco' },
            ].map(l => (
              <li key={l.path}><Link to={l.path} className="hover:text-primary transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Contatos por departamento */}
        <div>
          <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4">Contatos</h4>
          <div className="space-y-4 text-sm text-primary-foreground/70">
            {Object.values(DEPARTMENTS).map(dept => (
              <div key={dept.id}>
                <p className="font-medium text-primary-foreground/90">{dept.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3 w-3" /> <a href={`tel:${dept.phone}`} className="hover:text-primary transition-colors">{dept.phone}</a>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3 w-3" /> <a href={`mailto:${dept.email}`} className="hover:text-primary transition-colors">{dept.email}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-primary-foreground/50 gap-2">
        <span>© {new Date().getFullYear()} {COMPANY.fullName}. Todos os direitos reservados.</span>
        <span>{COMPANY.creci}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
