import { useState } from 'react';
import { Search, Calendar, FileSignature, KeyRound, ClipboardList, Camera, Users, Handshake } from 'lucide-react';

type Variant = 'buy' | 'rent' | 'list';

const steps: Record<Variant, { icon: any; title: string; text: string }[]> = {
  buy: [
    { icon: Search, title: 'Escolha o imóvel', text: 'Use a busca por bairro, tipo, valor e número de quartos para encontrar opções alinhadas ao que você procura.' },
    { icon: Calendar, title: 'Agende uma visita', text: 'Combinamos um horário que funcione para você. Visita acompanhada por um corretor da Líder.' },
    { icon: FileSignature, title: 'Proposta e documentação', text: 'Orientamos toda a negociação, análise de documentos e financiamento se necessário.' },
    { icon: KeyRound, title: 'Receba as chaves', text: 'Acompanhamos a assinatura do contrato e a entrega do imóvel com total transparência.' },
  ],
  rent: [
    { icon: Search, title: 'Escolha o imóvel', text: 'Filtre por bairro, valor e características para encontrar a opção ideal para alugar em Itaúna.' },
    { icon: Calendar, title: 'Agende uma visita', text: 'Marcamos a visita rapidamente, sempre com um corretor para tirar suas dúvidas.' },
    { icon: ClipboardList, title: 'Análise cadastral', text: 'Cuidamos da documentação, fiador, seguro fiança ou outras garantias com agilidade.' },
    { icon: KeyRound, title: 'Assine e mude-se', text: 'Contrato claro, sem letras miúdas, e suporte durante todo o período de locação.' },
  ],
  list: [
    { icon: ClipboardList, title: 'Avaliação gratuita', text: 'Analisamos seu imóvel com base no mercado local e sugerimos o melhor valor de venda ou aluguel.' },
    { icon: Camera, title: 'Divulgação profissional', text: 'Fotos, descrição e anúncio em todos os nossos canais para atrair os interessados certos.' },
    { icon: Users, title: 'Triagem e visitas', text: 'Filtramos contatos, conduzimos as visitas e mantemos você informado em cada etapa.' },
    { icon: Handshake, title: 'Negociação e fechamento', text: 'Cuidamos da proposta, contrato e entrega — você só precisa acompanhar.' },
  ],
};

const labels: Record<Variant, string> = {
  buy: 'Comprar',
  rent: 'Alugar',
  list: 'Anunciar',
};

interface HowItWorksProps {
  defaultVariant?: Variant;
  variants?: Variant[];
  title?: string;
  subtitle?: string;
  showTabs?: boolean;
}

const HowItWorks = ({
  defaultVariant = 'buy',
  variants = ['buy', 'rent', 'list'],
  title = 'Como funciona',
  subtitle = 'Um processo simples, transparente e acompanhado de perto pela nossa equipe.',
  showTabs = true,
}: HowItWorksProps) => {
  const [active, setActive] = useState<Variant>(defaultVariant);
  const current = steps[active];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
        </div>

        {showTabs && variants.length > 1 && (
          <div role="tablist" aria-label="Tipo de jornada" className="flex justify-center gap-1.5 mb-8 flex-wrap">
            {variants.map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={active === v}
                onClick={() => setActive(v)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  active === v
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/70'
                }`}
              >
                {labels[v]}
              </button>
            ))}
          </div>
        )}

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {current.map((s, i) => (
            <li key={s.title} className="relative bg-card border border-border rounded-lg p-5">
              <span className="absolute -top-3 left-5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </span>
              <s.icon className="h-6 w-6 text-primary mb-3" aria-hidden="true" />
              <h3 className="font-sans font-semibold text-foreground text-sm mb-1.5">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
