import { ShieldCheck, MapPin, MessagesSquare, Lock } from 'lucide-react';
import { COMPANY } from '@/data/constants';

const items = [
  { icon: ShieldCheck, title: COMPANY.creci, subtitle: 'Registro profissional ativo' },
  { icon: MapPin, title: 'Atendimento local em Itaúna', subtitle: 'Conhecimento real da região' },
  { icon: MessagesSquare, title: 'Resposta rápida no WhatsApp', subtitle: 'Atendimento humano em minutos' },
  { icon: Lock, title: 'Conformidade com a LGPD', subtitle: 'Seus dados protegidos' },
];

const TrustStrip = () => (
  <section className="border-y border-border bg-secondary/30">
    <div className="container mx-auto px-4 py-5 sm:py-6">
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((it) => (
          <li key={it.title} className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <it.icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight">{it.title}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight mt-0.5">{it.subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TrustStrip;
