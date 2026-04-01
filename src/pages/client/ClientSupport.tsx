import { Headphones, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ClientSupport = () => (
  <ClientLayout title="Suporte" description="Solicite suporte ou acompanhe suas solicitações.">
    <h1 className="text-xl font-sans font-bold text-foreground mb-1">Suporte</h1>
    <p className="text-muted-foreground text-sm mb-6">Abra uma solicitação ou acompanhe o andamento.</p>

    <div className="grid sm:grid-cols-3 gap-4 mb-8">
      {[
        { icon: MessageSquare, label: 'Abertas', value: '—', color: 'text-blue-600' },
        { icon: Clock, label: 'Em andamento', value: '—', color: 'text-amber-600' },
        { icon: CheckCircle, label: 'Resolvidas', value: '—', color: 'text-emerald-600' },
      ].map(s => (
        <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
          <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
          <p className="text-lg font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>

    <div className="bg-card border border-border rounded-lg p-6 text-center">
      <Headphones className="h-10 w-10 text-primary mx-auto mb-3" />
      <p className="text-foreground font-semibold mb-1">Precisa de ajuda?</p>
      <p className="text-sm text-muted-foreground mb-4">Entre em contato com nossa equipe de atendimento.</p>
      <Link to="/contato">
        <Button>Abrir solicitação</Button>
      </Link>
    </div>
  </ClientLayout>
);

export default ClientSupport;
