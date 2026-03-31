import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormStatus } from '@/data/types';

const Ombudsman = () => {
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <Layout>
      <PageHead title="Ouvidoria" description="Canal de ouvidoria da Líder Imóveis Itaúna. Envie sugestões, reclamações ou elogios." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Ouvidoria' }]} />
        <div className="max-w-2xl mx-auto pb-16">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Ouvidoria</h1>
          <p className="text-muted-foreground mb-8">
            Este é o nosso canal de ouvidoria. Envie sugestões, reclamações, elogios ou denúncias. Todas as mensagens são tratadas com sigilo e seriedade.
          </p>

          {status === 'success' ? (
            <div className="bg-accent rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Mensagem recebida!</h3>
              <p className="text-muted-foreground">Sua manifestação será analisada e respondida em até 5 dias úteis.</p>
              <Button className="mt-6" onClick={() => setStatus('idle')}>Enviar outra mensagem</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
              <Input placeholder="Nome completo" required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder="E-mail" type="email" required />
                <Input placeholder="Telefone" />
              </div>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-label="Tipo" required>
                <option value="">Tipo de manifestação</option>
                <option value="sugestao">Sugestão</option>
                <option value="reclamacao">Reclamação</option>
                <option value="elogio">Elogio</option>
                <option value="denuncia">Denúncia</option>
              </select>
              <Textarea placeholder="Descreva sua manifestação" rows={5} required />
              <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Enviando...' : 'Enviar manifestação'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Ombudsman;
