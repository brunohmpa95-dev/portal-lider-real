import { Home, Wrench, ClipboardCheck, Phone } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ClientRental = () => (
  <ClientLayout title="Locação" description="Informações e atendimento sobre locação de imóveis.">
    <h1 className="text-xl font-sans font-bold text-foreground mb-1">Locação</h1>
    <p className="text-muted-foreground text-sm mb-6">Informações e atendimento sobre seu imóvel alugado.</p>

    <div className="space-y-4">
      {[
        { icon: Wrench, title: 'Manutenções', desc: 'Solicite reparos ou manutenções no seu imóvel alugado.' },
        { icon: ClipboardCheck, title: 'Vistorias', desc: 'Agende vistoria de entrada, saída ou acompanhamento.' },
        { icon: Phone, title: 'Atendimento', desc: 'Fale diretamente com o setor de locação para outras questões.' },
      ].map(item => (
        <div key={item.title} className="bg-card border border-border rounded-lg p-5 flex items-start gap-4">
          <item.icon className="h-7 w-7 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-1">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        </div>
      ))}

      <div className="pt-2">
        <Link to="/contato">
          <Button className="w-full sm:w-auto">Solicitar atendimento</Button>
        </Link>
      </div>
    </div>
  </ClientLayout>
);

export default ClientRental;
