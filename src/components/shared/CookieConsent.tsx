import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Shield } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-lg p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <Shield className="h-8 w-8 text-primary shrink-0 hidden md:block" />
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium mb-1">
              Privacidade e Cookies
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utilizamos cookies para melhorar sua experiência de navegação e analisar o tráfego do site.
              Ao clicar em "Aceitar", você concorda com o uso de cookies conforme nossa{' '}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              , em conformidade com a LGPD (Lei nº 13.709/2018).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConsent('essential-only')}
              className="flex-1 md:flex-none text-xs"
            >
              Apenas essenciais
            </Button>
            <Button
              size="sm"
              onClick={() => handleConsent('accepted')}
              className="flex-1 md:flex-none text-xs"
            >
              Aceitar todos
            </Button>
          </div>
          <button
            onClick={() => handleConsent('essential-only')}
            className="absolute top-3 right-3 md:static text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
