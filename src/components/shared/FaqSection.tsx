import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
  injectJsonLd?: boolean;
  className?: string;
}

const FaqSection = ({
  items,
  title = 'Perguntas frequentes',
  subtitle,
  injectJsonLd = true,
  className = '',
}: FaqSectionProps) => (
  <section className={`py-12 md:py-16 bg-secondary/30 ${className}`}>
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">{title}</h2>
        {subtitle && <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>}
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-lg px-4">
            <AccordionTrigger className="text-sm sm:text-base font-medium text-foreground text-left hover:no-underline py-4">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
              {it.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {injectJsonLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((it) => ({
              '@type': 'Question',
              name: it.q,
              acceptedAnswer: { '@type': 'Answer', text: it.a },
            })),
          })}</script>
        </Helmet>
      )}
    </div>
  </section>
);

export default FaqSection;
