import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PROPERTY_TYPES, NEIGHBORHOODS } from '@/data/constants';
import { FormStatus } from '@/data/types';
import { Building2 } from 'lucide-react';

const Advertise = () => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <Layout>
      <PageHead title="Anuncie seu Imóvel" description="Cadastre seu imóvel para venda ou locação com a Líder Imóveis Itaúna. Avaliação gratuita e sem compromisso." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Anuncie seu Imóvel' }]} />

        <div className="max-w-2xl mx-auto pb-16">
          <div className="text-center mb-10">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Anuncie seu Imóvel
            </h1>
            <p className="text-muted-foreground text-lg">
              Preencha o formulário abaixo e nossa equipe entrará em contato para avaliar seu imóvel sem compromisso.
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-accent rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Imóvel cadastrado com sucesso!</h3>
              <p className="text-muted-foreground">Nossa equipe entrará em contato em até 24 horas para agendar uma visita de avaliação.</p>
              <Button className="mt-6" onClick={() => setStatus('idle')}>Cadastrar outro imóvel</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
              <h2 className="font-sans font-semibold text-foreground">Seus dados</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder="Nome completo" required />
                <Input placeholder="Telefone / WhatsApp" required />
              </div>
              <Input placeholder="E-mail" type="email" required />

              <h2 className="font-sans font-semibold text-foreground pt-4">Dados do imóvel</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <select className={selectClass} aria-label="Finalidade" required>
                  <option value="">Finalidade</option>
                  <option value="sale">Venda</option>
                  <option value="rent">Locação</option>
                </select>
                <select className={selectClass} aria-label="Tipo do imóvel" required>
                  <option value="">Tipo do imóvel</option>
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <select className={selectClass} aria-label="Bairro">
                  <option value="">Bairro</option>
                  {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <Input placeholder="Endereço completo" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input placeholder="Quartos" type="number" min={0} />
                <Input placeholder="Banheiros" type="number" min={0} />
                <Input placeholder="Vagas" type="number" min={0} />
              </div>
              <Input placeholder="Área (m²)" type="number" min={0} />
              <Input placeholder="Valor pretendido (R$)" type="number" min={0} />
              <Textarea placeholder="Descrição e observações sobre o imóvel" rows={4} />

              <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Enviando...' : 'Enviar para análise'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Advertise;
