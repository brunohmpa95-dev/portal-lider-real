import { Link } from 'react-router-dom';
import { FileText, Headphones, DollarSign, Home, ArrowRight, LogOut, Shield } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/data/constants';
import { ROLE_LABELS } from '@/lib/auth-types';

const ClientArea = () => {
  const { user, profile, roles, signOut, signOutAllSessions } = useAuth();

  const actions = [
    { icon: FileText, label: 'Documentos', desc: 'Consulte boletos, contratos e recibos.', href: '/documentos', external: false },
    { icon: Headphones, label: 'Suporte', desc: 'Abra uma solicitação ou fale com nossa equipe.', href: '/contato', external: false },
    { icon: DollarSign, label: 'Financeiro', desc: 'Pagamentos, reajustes e negociações.', href: '/contato', external: false },
    { icon: Home, label: 'Locação', desc: 'Manutenções, vistorias e questões do imóvel.', href: '/contato', external: false },
  ];

  return (
    <Layout>
      <PageHead title="Área do Cliente" description="Acesse a Área do Cliente da Líder Imóveis Itaúna." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Área do Cliente' }]} />

        <div className="max-w-3xl mx-auto pb-12">
          {/* User card */}
          <div className="bg-card border border-border rounded-lg p-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-sans font-bold text-foreground mb-0.5 truncate">
                  Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}
                </h1>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {roles.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      {roles.map(r => ROLE_LABELS[r]).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5 text-xs h-8">
                  <LogOut className="h-3.5 w-3.5" /> Sair
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOutAllSessions()} className="gap-1.5 text-[10px] text-muted-foreground h-7">
                  Sair de todas
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-3">
            {actions.map(a => (
              a.external ? (
                <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-all group">
                  <a.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-semibold text-foreground text-sm mb-0.5 flex items-center gap-1">{a.label} <ArrowRight className="h-3 w-3" /></p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </a>
              ) : (
                <Link key={a.label} to={a.href} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-all group">
                  <a.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-semibold text-foreground text-sm mb-0.5">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
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
