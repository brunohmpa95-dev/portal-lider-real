import { Link } from 'react-router-dom';
import { LogIn, FileText, Headphones, DollarSign, Home, ArrowRight, LogOut, Shield } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/data/constants';
import { ROLE_LABELS } from '@/lib/auth-types';

const ClientArea = () => {
  const { user, profile, roles, signOut, signOutAllSessions } = useAuth();

  const actions = [
    { icon: LogIn, label: 'Entrar no Sistema', desc: 'Acesse o painel completo com seus dados, contratos e solicitações.', href: COMPANY.systemUrl, external: true },
    { icon: FileText, label: 'Acessar Documentos', desc: 'Consulte boletos, contratos, recibos e outros documentos.', href: '/documentos', external: false },
    { icon: Headphones, label: 'Solicitar Suporte', desc: 'Abra uma solicitação ou fale com nossa equipe de atendimento.', href: '/contato', external: false },
    { icon: DollarSign, label: 'Atendimento Financeiro', desc: 'Questões sobre pagamentos, reajustes e negociações.', href: '/contato', external: false },
    { icon: Home, label: 'Atendimento Locação', desc: 'Manutenções, vistorias e questões do seu imóvel alugado.', href: '/contato', external: false },
  ];

  return (
    <Layout>
      <PageHead title="Área do Cliente" description="Acesse a Área do Cliente da Líder Imóveis." />
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto py-8">
          {/* User info */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                  Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}
                </h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {roles.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {roles.map(r => ROLE_LABELS[r]).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5 text-xs">
                  <LogOut className="h-3.5 w-3.5" /> Sair
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOutAllSessions()}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  Sair de todas as sessões
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {actions.map(a => (
              a.external ? (
                <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 bg-card border border-border rounded-lg p-6 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                  <a.icon className="h-8 w-8 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-sans font-semibold text-foreground mb-1 flex items-center gap-1.5">{a.label} <ArrowRight className="h-3.5 w-3.5" /></p>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </a>
              ) : (
                <Link key={a.label} to={a.href} className="flex items-start gap-4 bg-card border border-border rounded-lg p-6 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                  <a.icon className="h-8 w-8 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-sans font-semibold text-foreground mb-1">{a.label}</p>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientArea;
