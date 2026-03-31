import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { COMPANY, DEPARTMENTS } from '@/data/constants';
import { FormStatus } from '@/data/types';

const Contact = () => {
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <Layout>
      <PageHead title="Contato" description="Entre em contato com a Líder Imóveis Itaúna. Atendimento personalizado para compra, venda e locação de imóveis." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Contato' }]} />

        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-10">Fale Conosco</h1>

        <div className="grid lg:grid-cols-2 gap-12 pb-16">
          {/* Form */}
          <div>
            {status === 'success' ? (
              <div className="bg-accent rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Mensagem enviada!</h3>
                <p className="text-muted-foreground">Retornaremos em breve.</p>
                <Button className="mt-6" onClick={() => setStatus('idle')}>Enviar outra mensagem</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
                <Input placeholder="Nome completo" required />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input placeholder="E-mail" type="email" required />
                  <Input placeholder="Telefone" />
                </div>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" aria-label="Assunto">
                  <option value="">Selecione o assunto</option>
                  <option value="compra">Compra de imóvel</option>
                  <option value="venda">Venda de imóvel</option>
                  <option value="locacao">Locação</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="outro">Outro</option>
                </select>
                <Textarea placeholder="Sua mensagem" rows={5} required />
                <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Enviando...' : 'Enviar mensagem'}
                </Button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-sans text-lg font-semibold text-foreground mb-4">Informações</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />{COMPANY.address}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{COMPANY.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{COMPANY.email}</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{COMPANY.hours}</p>
              </div>
            </div>

            <div>
              <h2 className="font-sans text-lg font-semibold text-foreground mb-4">Contatos por Departamento</h2>
              <div className="space-y-4">
                {Object.values(DEPARTMENTS).map(dept => (
                  <div key={dept.id} className="bg-secondary rounded-lg p-4">
                    <p className="font-semibold text-foreground text-sm mb-1">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.phone} · {dept.email}</p>
                    <p className="text-xs text-muted-foreground">{dept.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
