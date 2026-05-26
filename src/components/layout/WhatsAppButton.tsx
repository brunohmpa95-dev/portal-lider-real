import { MessageCircle } from 'lucide-react';
import { useLocation, matchPath } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import WhatsAppCTA from '@/components/shared/WhatsAppCTA';

const WhatsAppButton = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isPropertyDetail = matchPath('/imovel/:id', location.pathname);
  if (isMobile && isPropertyDetail) return null;

  return (
    <WhatsAppCTA
      intent="speak"
      source="floating-button"
      aria-label="Fale conosco pelo WhatsApp"
      style={{ bottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
      className="fixed right-4 sm:!bottom-6 sm:right-6 z-50 bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all min-h-12 min-w-12 flex items-center justify-center"
    >
      <MessageCircle className="h-6 w-6" />
    </WhatsAppCTA>
  );
};

export default WhatsAppButton;

