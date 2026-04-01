import { DollarSign, FileText, AlertCircle } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { COMPANY } from '@/data/constants';

const ClientFinancial = () => (
  <ClientLayout title="Financeiro" description="Acompanhe pagamentos e informações financeiras.">
    <h1 className="text-xl font-sans font-bold text-foreground mb-1">Financeiro</h1>
    <p className="text-muted-foreground text-sm mb-6">Acompanhe seus pagamentos e documentos financeiros.</p>

    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <DollarSign className="h-8 w-8 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-1">Segunda via de boleto</p>
            <p className="text-sm text-muted-foreground mb-3">Acesse o sistema principal para emitir segunda via de boletos e consultar pagamentos.</p>
            <a href={COMPANY.systemUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm">Acessar sistema</Button>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <FileText className="h-8 w-8 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-1">Declarações e recibos</p>
            <p className="text-sm text-muted-foreground mb-3">Solicite declaração de quitação, recibos de pagamento e outros documentos financeiros.</p>
            <a href={COMPANY.systemUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">Solicitar</Button>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Dúvidas sobre reajustes ou negociações?</p>
          <p className="text-xs text-amber-700 mt-0.5">Entre em contato pelo WhatsApp ou telefone com nosso setor financeiro.</p>
        </div>
      </div>
    </div>
  </ClientLayout>
);

export default ClientFinancial;
