import { Instagram, Facebook, Phone } from 'lucide-react';
import { COMPANY } from '@/data/constants';

const TopBar = () => (
  <div className="bg-foreground text-primary-foreground text-xs py-2 hidden md:block">
    <div className="container mx-auto flex items-center justify-between px-4">
      <span className="tracking-wide font-medium">{COMPANY.creci}</span>
      <div className="flex items-center gap-5">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
          <Phone className="h-3 w-3" /> {COMPANY.phone}
        </a>
        <div className="flex items-center gap-3">
          <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
            <Instagram className="h-3.5 w-3.5" />
          </a>
          <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors">
            <Facebook className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default TopBar;
