import { COMPANY } from '@/data/constants';
import { supabase } from '@/integrations/supabase/client';

export type WhatsAppIntent = 'buy' | 'rent' | 'list' | 'speak' | 'visit' | 'general';

interface WhatsAppContext {
  propertyId?: string;
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

export function buildWhatsAppMessage(intent: WhatsAppIntent, ctx: WhatsAppContext = {}): string {
  return messages[intent](ctx);
}

export function buildWhatsAppLink(intent: WhatsAppIntent, ctx: WhatsAppContext = {}): string {
  const text = buildWhatsAppMessage(intent, ctx);
  return `${COMPANY.whatsappLink}?text=${encodeURIComponent(text)}`;
}

// ---------- FASE 1: tracking de cliques ----------

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    const KEY = 'lider_visitor_id';
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() || `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'no_storage';
  }
}

function readUtm() {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    utm_source: sp.get('utm_source') || undefined,
    utm_medium: sp.get('utm_medium') || undefined,
    utm_campaign: sp.get('utm_campaign') || undefined,
    utm_term: sp.get('utm_term') || undefined,
    utm_content: sp.get('utm_content') || undefined,
  };
}

export interface TrackWhatsAppClickInput {
  intent: WhatsAppIntent;
  page?: string;
  context?: WhatsAppContext;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Registra clique no WhatsApp no CRM (best-effort, não bloqueia o redirect).
 * Em caso de erro, falha silenciosamente — os botões continuam funcionando.
 */
export async function trackWhatsAppClick(input: TrackWhatsAppClickInput): Promise<void> {
  try {
    const utm = readUtm();
    const url = typeof window !== 'undefined' ? window.location.href : null;
    const referrer = typeof document !== 'undefined' ? document.referrer || null : null;
    const message = input.message || buildWhatsAppMessage(input.intent, input.context);

    await supabase.rpc('record_whatsapp_click' as any, {
      _intent: input.intent,
      _page: input.page || (typeof window !== 'undefined' ? window.location.pathname : null),
      _url: url,
      _referrer: referrer,
      _utm_source: utm.utm_source ?? null,
      _utm_medium: utm.utm_medium ?? null,
      _utm_campaign: utm.utm_campaign ?? null,
      _utm_term: utm.utm_term ?? null,
      _utm_content: utm.utm_content ?? null,
      _property_id: input.context?.propertyId ?? null,
      _property_code: input.context?.propertyCode ?? null,
      _property_title: input.context?.propertyTitle ?? null,
      _neighborhood: input.context?.neighborhood ?? null,
      _message_sent: message,
      _visitor_id: getVisitorId(),
      _metadata: input.metadata ?? {},
    });
  } catch (err) {
    // best-effort
    console.warn('[whatsapp] tracking falhou:', err);
  }
}
