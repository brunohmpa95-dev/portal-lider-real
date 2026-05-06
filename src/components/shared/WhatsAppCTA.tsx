import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { buildWhatsAppLink, trackWhatsAppClick, type WhatsAppIntent } from '@/lib/whatsapp';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> {
  intent?: WhatsAppIntent;
  propertyId?: string;
  propertyCode?: string;
  propertyTitle?: string;
  neighborhood?: string;
  /** Identifica visualmente onde o CTA está (ex.: 'hero', 'card-imovel', 'rodape'). */
  source?: string;
  /** Sobrescreve o href gerado (caso exista um link customizado). */
  href?: string;
  children?: ReactNode;
}

/**
 * CTA reutilizável de WhatsApp. Registra o clique no CRM (best-effort)
 * antes de seguir o link, sem bloquear o redirecionamento.
 */
const WhatsAppCTA = forwardRef<HTMLAnchorElement, Props>(function WhatsAppCTA(
  {
    intent = 'speak',
    propertyId,
    propertyCode,
    propertyTitle,
    neighborhood,
    source,
    href,
    onClick,
    target = '_blank',
    rel = 'noopener noreferrer',
    children,
    ...rest
  },
  ref,
) {
  const ctx = { propertyId, propertyCode, propertyTitle, neighborhood };
  const finalHref = href || buildWhatsAppLink(intent, ctx);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // dispara fire-and-forget — não aguarda
    void trackWhatsAppClick({
      intent,
      context: ctx,
      metadata: source ? { source } : undefined,
    });
    onClick?.(e);
  }

  return (
    <a ref={ref} href={finalHref} target={target} rel={rel} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
});

export default WhatsAppCTA;
