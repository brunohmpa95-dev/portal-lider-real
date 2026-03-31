import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormStatus } from '@/data/types';

const Careers = () => {
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <Layout>
      <PageHead title="Trabalhe Conosco" description="Faça parte da equipe Líder Imóveis Itaúna. Envie seu currículo e venha crescer com a gente." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Trabalhe Conosco' }]} />
        <div className="max-w-2xl mx-auto pb-16">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Trabalhe Conosco</h1>
          <p className="text-muted-foreground mb-8">
            Estamos sempre em busca de profissionais comprometidos e apaixonados pelo mercado imobiliário. Envie seu currículo e venha fazer parte da nossa equipe.
          </p>

          {status === 'success' ? (
            <div className="bg-accent rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Currículo enviado!</h3>
              <p className="text-muted-foreground">Agradecemos pelo interesse. Caso seu perfil seja compatível, entraremos em contato.</p>
              <Button className="mt-6" onClick={() => setStatus('idle')}>Enviar outro currículo</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
              <Input placeholder="Nome completo" required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder="E-mail" type="email" required />
                <Input placeholder="Telefone / WhatsApp" required />
              </div>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-label="Área de interesse" required>
                <option value="">Área de interesse</option>
                <option value="vendas">Vendas</option>
                <option value="locacao">Locação</option>
                <option value="administrativo">Administrativo</option>
                <option value="marketing">Marketing</option>
                <option value="outro">Outro</option>
              </select>
              <Textarea placeholder="Conte um pouco sobre sua experiência e motivação" rows={5} required />
              <p className="text-xs text-muted-foreground">* Anexo de currículo estará disponível em breve via sistema integrado.</p>
              <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Enviando...' : 'Enviar currículo'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Careers;
