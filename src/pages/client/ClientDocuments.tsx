import { FileText, Download, ExternalLink } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { COMPANY } from '@/data/constants';

const documents = [
  { title: 'Segunda via de boleto', desc: 'Acesse o sistema para emitir segunda via de boletos.', href: COMPANY.systemUrl, type: 'external' },
  { title: 'Contrato de locação', desc: 'Modelo padrão de contrato de locação residencial.', href: '#', type: 'download' },
  { title: 'Ficha cadastral', desc: 'Ficha para cadastro de novos locatários.', href: '#', type: 'download' },
  { title: 'Laudo de vistoria', desc: 'Modelo de laudo de vistoria de entrada e saída.', href: '#', type: 'download' },
  { title: 'Autorização de venda', desc: 'Documento de autorização para comercialização do imóvel.', href: '#', type: 'download' },
  { title: 'Declaração de quitação', desc: 'Solicite via sistema ou entre em contato com o financeiro.', href: COMPANY.systemUrl, type: 'external' },
];

const ClientDocuments = () => (
  <ClientLayout title="Documentos" description="Acesse documentos e formulários da Líder Imóveis.">
    <h1 className="text-xl font-sans font-bold text-foreground mb-1">Documentos</h1>
    <p className="text-muted-foreground text-sm mb-6">Acesse documentos, formulários e modelos úteis.</p>

    <div className="space-y-3">
      {documents.map(doc => (
        <a
          key={doc.title}
          href={doc.href}
          target={doc.type === 'external' ? '_blank' : undefined}
          rel={doc.type === 'external' ? 'noopener noreferrer' : undefined}
          className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-sans font-semibold text-foreground text-sm">{doc.title}</p>
            <p className="text-xs text-muted-foreground">{doc.desc}</p>
          </div>
          {doc.type === 'external' ? <ExternalLink className="h-4 w-4 text-muted-foreground" /> : <Download className="h-4 w-4 text-muted-foreground" />}
        </a>
      ))}
    </div>
  </ClientLayout>
);

export default ClientDocuments;
