import { MessageCircle } from 'lucide-react';
import { COMPANY } from '@/data/constants';

const WhatsAppButton = () => (
  <a
    href={COMPANY.whatsappLink}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco pelo WhatsApp"
    className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
  >
    <MessageCircle className="h-6 w-6" />
  </a>
);

export default WhatsAppButton;
