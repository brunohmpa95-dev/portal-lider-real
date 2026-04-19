import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { COMPANY, DEPARTMENTS } from '@/data/constants';
import logoImg from '@/assets/logo-transparent.png';

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-10 sm:py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* Brand */}
        <div>
          <img src={logoImg} alt="Líder Imóveis" className="h-10 w-auto mb-3 brightness-0 invert" loading="lazy" />
          <p className="text-xs text-primary-foreground/60 mb-3 leading-relaxed">
            Imobiliária moderna em Itaúna e região. Atendimento próximo, transparente e eficiente.
          </p>
          <div className="space-y-1.5 text-xs text-primary-foreground/60">
            <p className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" />{COMPANY.hours}</p>
            <p className="flex items-start gap-1.5"><MapPin className="h-3 w-3 shrink-0 mt-0.5" />{COMPANY.address}</p>
          </div>
          <div className="flex items-center gap-2.5 mt-3">
            <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/50 hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></a>
            <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/50 hover:text-primary transition-colors"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-primary-foreground/80">Navegação</h4>
          <ul className="space-y-1.5 text-xs text-primary-foreground/60">
            {[
              { label: 'Comprar', path: '/comprar' },
              { label: 'Alugar', path: '/alugar' },
              { label: 'Sobre nós', path: '/sobre' },
              { label: 'Anuncie seu imóvel', path: '/anuncie' },
              { label: 'Financiamento', path: '/financiamento' },
              { label: 'Contato', path: '/contato' },
              { label: 'Privacidade', path: '/privacidade' },
            ].map(l => (
              <li key={l.path}><Link to={l.path} className="hover:text-primary transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Access */}
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-primary-foreground/80">Área do Cliente</h4>
          <ul className="space-y-1.5 text-xs text-primary-foreground/60">
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

        {/* Contacts */}
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-primary-foreground/80">Contatos</h4>
          <div className="space-y-3 text-xs text-primary-foreground/60">
            {Object.values(DEPARTMENTS).map(dept => (
              <div key={dept.id}>
                <p className="font-medium text-primary-foreground/80 text-[11px]">{dept.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="h-2.5 w-2.5" />
                  <a href={`tel:${dept.phone}`} className="hover:text-primary transition-colors">{dept.phone}</a>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail className="h-2.5 w-2.5" />
                  <a href={`mailto:${dept.email}`} className="hover:text-primary transition-colors text-[10px]">{dept.email}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10 py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-primary-foreground/40 gap-1">
        <span>© {new Date().getFullYear()} {COMPANY.fullName}. Todos os direitos reservados.</span>
        <span>{COMPANY.creci}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
