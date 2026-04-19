import { COMPANY } from '@/data/constants';

export type WhatsAppIntent = 'buy' | 'rent' | 'list' | 'speak' | 'visit' | 'general';

interface WhatsAppContext {
  propertyCode?: string;
  propertyTitle?: string;
  neighborhood?: string;
}

const messages: Record<WhatsAppIntent, (ctx: WhatsAppContext) => string> = {
  buy: (ctx) =>
    ctx.propertyCode
      ? `Olá! Tenho interesse em comprar o imóvel ${ctx.propertyCode}${ctx.propertyTitle ? ` - ${ctx.propertyTitle}` : ''}. Pode me passar mais informações?`
      : 'Olá! Estou procurando um imóvel para comprar em Itaúna. Pode me ajudar?',
  rent: (ctx) =>
    ctx.propertyCode
      ? `Olá! Tenho interesse em alugar o imóvel ${ctx.propertyCode}${ctx.propertyTitle ? ` - ${ctx.propertyTitle}` : ''}. Pode me passar mais informações?`
      : 'Olá! Estou procurando um imóvel para alugar em Itaúna. Pode me ajudar?',
  list: () =>
    'Olá! Tenho um imóvel e gostaria de anunciar com a Líder Imóveis. Pode me orientar sobre os próximos passos?',
  speak: () =>
    'Olá! Gostaria de falar com um especialista da Líder Imóveis Itaúna.',
  visit: (ctx) =>
    ctx.propertyCode
      ? `Olá! Gostaria de agendar uma visita ao imóvel ${ctx.propertyCode}${ctx.propertyTitle ? ` - ${ctx.propertyTitle}` : ''}.`
      : 'Olá! Gostaria de agendar uma visita a um imóvel.',
  general: () => 'Olá! Vim pelo site da Líder Imóveis Itaúna.',
};

export function buildWhatsAppLink(intent: WhatsAppIntent, ctx: WhatsAppContext = {}): string {
  const text = messages[intent](ctx);
  return `${COMPANY.whatsappLink}?text=${encodeURIComponent(text)}`;
}
