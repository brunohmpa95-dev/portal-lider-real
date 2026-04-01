import { FileText, Download, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { COMPANY } from '@/data/constants';

const documents = [
  { title: 'Segunda via de boleto', desc: 'Acesse o sistema para emitir segunda via de boletos.', href: COMPANY.systemUrl, type: 'external' },
  { title: 'Contrato de locação', desc: 'Modelo padrão de contrato de locação residencial.', href: '#', type: 'download' },
  { title: 'Ficha cadastral', desc: 'Ficha para cadastro de novos locatários.', href: '#', type: 'download' },
  { title: 'Laudo de vistoria', desc: 'Modelo de laudo de vistoria de entrada e saída.', href: '#', type: 'download' },
  { title: 'Autorização de venda', desc: 'Documento de autorização para comercialização do imóvel.', href: '#', type: 'download' },
  { title: 'Declaração de quitação', desc: 'Solicite via sistema ou entre em contato com o financeiro.', href: COMPANY.systemUrl, type: 'external' },
];

const Documents = () => (
  <Layout>
    <PageHead title="Documentos" description="Acesse documentos, formulários e modelos da Líder Imóveis Itaúna." />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Documentos' }]} />
      <div className="max-w-3xl mx-auto pb-16">
        <h1 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-4">Documentos</h1>
        <p className="text-muted-foreground mb-8">Acesse documentos, formulários e modelos úteis. Alguns itens redirecionam para o sistema principal.</p>

        <div className="space-y-3">
          {documents.map(doc => (
            <a key={doc.title} href={doc.href} target={doc.type === 'external' ? '_blank' : undefined} rel={doc.type === 'external' ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-4 bg-card border border-border rounded-lg p-5 hover:border-primary/30 hover:shadow-sm transition-all group">
              <FileText className="h-6 w-6 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-sans font-semibold text-foreground text-sm">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.desc}</p>
              </div>
              {doc.type === 'external' ? <ExternalLink className="h-4 w-4 text-muted-foreground" /> : <Download className="h-4 w-4 text-muted-foreground" />}
            </a>
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default Documents;
