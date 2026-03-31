import { Link } from 'react-router-dom';
import { LogIn, FileText, Headphones, DollarSign, Home, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { COMPANY } from '@/data/constants';

const actions = [
  { icon: LogIn, label: 'Entrar no Sistema', desc: 'Acesse o painel completo com seus dados, contratos e solicitações.', href: COMPANY.systemUrl, external: true },
  { icon: FileText, label: 'Acessar Documentos', desc: 'Consulte boletos, contratos, recibos e outros documentos.', href: '/documentos', external: false },
  { icon: Headphones, label: 'Solicitar Suporte', desc: 'Abra uma solicitação ou fale com nossa equipe de atendimento.', href: '/contato', external: false },
  { icon: DollarSign, label: 'Atendimento Financeiro', desc: 'Questões sobre pagamentos, reajustes e negociações.', href: '/contato', external: false },
  { icon: Home, label: 'Atendimento Locação', desc: 'Manutenções, vistorias e questões do seu imóvel alugado.', href: '/contato', external: false },
];

const ClientArea = () => (
  <Layout>
    <PageHead title="Área do Cliente" description="Acesse a Área do Cliente da Líder Imóveis. Consulte documentos, solicite suporte e acompanhe seus contratos." />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Área do Cliente' }]} />

      <div className="max-w-3xl mx-auto text-center py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Área do Cliente
        </h1>
        <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
          Acesse serviços, documentos, solicitações e acompanhe tudo sobre seus imóveis em um só lugar.
        </p>

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

        {/* Primary CTA */}
        <div className="bg-primary text-primary-foreground rounded-lg p-8">
          <h2 className="text-xl font-display font-semibold mb-3">Acesse o sistema principal</h2>
          <p className="text-primary-foreground/80 mb-6 text-sm">
            Para visualizar contratos, realizar pagamentos e gerenciar seus imóveis, entre no sistema completo.
          </p>
          <a href={COMPANY.systemUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="gap-2">
              <LogIn className="h-5 w-5" /> Entrar no Sistema
            </Button>
          </a>
        </div>
      </div>
    </div>
  </Layout>
);

export default ClientArea;
