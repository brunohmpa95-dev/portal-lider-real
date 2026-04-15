import { FileText, Download, ExternalLink, Info } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { COMPANY } from '@/data/constants';

const documents = [
  { title: 'Segunda via de boleto', desc: 'Acesse o sistema para emitir segunda via.', href: COMPANY.systemUrl, type: 'external' as const },
  { title: 'Contrato de locação', desc: 'Modelo padrão de contrato residencial.', href: '#', type: 'download' as const },
  { title: 'Ficha cadastral', desc: 'Ficha para cadastro de novos locatários.', href: '#', type: 'download' as const },
  { title: 'Laudo de vistoria', desc: 'Modelo de laudo de entrada e saída.', href: '#', type: 'download' as const },
  { title: 'Autorização de venda', desc: 'Documento de autorização para comercialização.', href: '#', type: 'download' as const },
  { title: 'Declaração de quitação', desc: 'Solicite via sistema ou entre em contato.', href: COMPANY.systemUrl, type: 'external' as const },
];

const Documents = () => (
  <Layout>
    <PageHead title="Documentos" description="Acesse documentos, formulários e modelos da Líder Imóveis Itaúna." />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Documentos' }]} />
      <div className="max-w-3xl mx-auto pb-12">
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground mb-2">Documentos</h1>
        <p className="text-sm text-muted-foreground mb-6">Formulários, modelos e documentos úteis. Itens com seta redirecionam para o sistema.</p>

        {/* Info note */}
        <div className="flex items-start gap-3 bg-accent/50 border border-accent rounded-lg p-4 mb-6">
          <Info className="h-4 w-4 text-accent-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-accent-foreground leading-relaxed">
            Alguns documentos podem estar em fase de disponibilização. Se precisar de algo específico, entre em <a href="/contato" className="underline font-medium">contato</a>.
          </p>
        </div>

        <div className="space-y-2">
          {documents.map(doc => (
            <a
              key={doc.title}
              href={doc.href}
              target={doc.type === 'external' ? '_blank' : undefined}
              rel={doc.type === 'external' ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-foreground text-sm">{doc.title}</p>
                <p className="text-[11px] text-muted-foreground">{doc.desc}</p>
              </div>
              {doc.type === 'external' ? (
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : (
                <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default Documents;
