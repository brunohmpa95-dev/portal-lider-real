import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'lider_cookie_consent';

type ConsentValue = 'accepted' | 'essential-only';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (value: ConsentValue) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-40 p-3 sm:p-4 animate-fade-in">
      <div className="container mx-auto max-w-3xl">
        <div className="relative bg-card border border-border rounded-lg shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 pr-6 sm:pr-0">
            <p className="text-xs text-foreground font-medium mb-0.5">Privacidade e Cookies</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Usamos cookies essenciais conforme nossa{' '}
              <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link> (LGPD).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => handleConsent('essential-only')} className="flex-1 sm:flex-none text-xs h-8">
              Essenciais
            </Button>
            <Button size="sm" onClick={() => handleConsent('accepted')} className="flex-1 sm:flex-none text-xs h-8">
              Aceitar
            </Button>
          </div>
          <button onClick={() => handleConsent('essential-only')} className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground" aria-label="Fechar">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
