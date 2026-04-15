import { Link } from 'react-router-dom';
import { FileText, Headphones, DollarSign, Home, ArrowRight } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { useAuth } from '@/contexts/AuthContext';

const shortcuts = [
  { icon: FileText, label: 'Documentos', desc: 'Consulte boletos, contratos, recibos e outros documentos.', path: '/cliente/documentos' },
  { icon: Headphones, label: 'Atendimento', desc: 'Abra uma solicitação ou fale com nossa equipe.', path: '/cliente/atendimento' },
  { icon: DollarSign, label: 'Financeiro', desc: 'Pagamentos, reajustes e negociações.', path: '/cliente/financeiro' },
  { icon: Home, label: 'Imóveis', desc: 'Seus imóveis e contratos vinculados.', path: '/cliente/imoveis' },
];

const ClientDashboard = () => {
  const { profile } = useAuth();

  return (
    <ClientLayout title="Painel" description="Painel do cliente Líder Imóveis.">
      <h1 className="text-2xl font-sans font-bold text-foreground mb-1">
        Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}
      </h1>
      <p className="text-muted-foreground text-sm mb-6">O que você precisa hoje?</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {shortcuts.map(s => (
          <Link
            key={s.path}
            to={s.path}
            className="flex items-start gap-4 bg-card border border-border rounded-lg p-5 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <s.icon className="h-7 w-7 text-primary shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="font-sans font-semibold text-foreground text-sm flex items-center gap-1.5">
                {s.label} <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
