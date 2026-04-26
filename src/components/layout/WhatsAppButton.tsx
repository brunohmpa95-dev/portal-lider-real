import { MessageCircle } from 'lucide-react';
import { useLocation, matchPath } from 'react-router-dom';
import { COMPANY } from '@/data/constants';
import { useIsMobile } from '@/hooks/use-mobile';

const WhatsAppButton = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Em mobile, esconder o botão flutuante na página de detalhe do imóvel
  // (já existe um CTA inline grande no topo da página).
  const isPropertyDetail = matchPath('/imovel/:id', location.pathname);
  if (isMobile && isPropertyDetail) return null;

  return (
    <a
      href={COMPANY.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};

export default WhatsAppButton;
