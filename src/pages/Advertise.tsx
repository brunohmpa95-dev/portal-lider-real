import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PROPERTY_TYPES, NEIGHBORHOODS } from '@/data/constants';
import { submitForm } from '@/lib/form-submit';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { n: '1', text: 'Preencha o formulário com os dados do imóvel.' },
  { n: '2', text: 'Nossa equipe analisará as informações enviadas.' },
  { n: '3', text: 'Entraremos em contato para agendar uma visita, se necessário.' },
];

const Advertise = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();
  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast({ title: "Consentimento necessário", description: "Você precisa concordar com a política de privacidade.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitForm('listing', {
        owner_name: fd.get('owner_name'),
        owner_phone: fd.get('owner_phone'),
        owner_email: fd.get('owner_email'),
        purpose: fd.get('purpose'),
        property_type: fd.get('property_type'),
        neighborhood: fd.get('neighborhood'),
        address: fd.get('address'),
        bedrooms: fd.get('bedrooms'),
        bathrooms: fd.get('bathrooms'),
        parking_spots: fd.get('parking_spots'),
        area: fd.get('area'),
        asking_price: fd.get('asking_price'),
        description: fd.get('description'),
      });
      setSuccess(true);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHead title="Anuncie seu Imóvel" description="Cadastre seu imóvel para venda ou locação com a Líder Imóveis Itaúna." />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Anuncie seu Imóvel' }]} />
        <div className="max-w-3xl mx-auto pb-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Building2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground mb-2">Anuncie seu Imóvel</h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Preencha os dados abaixo e nossa equipe fará uma análise sem compromisso.
            </p>
          </div>

          {/* How it works */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {steps.map(s => (
              <div key={s.n} className="flex-1 flex items-start gap-3 bg-secondary/60 rounded-lg p-4">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{s.n}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          {success ? (
            <div className="bg-accent rounded-lg p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Imóvel cadastrado!</h3>
              <p className="text-sm text-muted-foreground">Entraremos em contato em breve para dar andamento.</p>
              <Button size="sm" className="mt-5" onClick={() => setSuccess(false)}>Cadastrar outro</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 sm:p-6">
              {/* Owner info */}
              <h2 className="font-sans font-semibold text-foreground text-sm mb-3">Seus dados</h2>
              <div className="space-y-3 mb-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input name="owner_name" placeholder="Nome completo" required minLength={2} maxLength={100} className="h-10" />
                  <Input name="owner_phone" placeholder="Telefone / WhatsApp" required maxLength={20} className="h-10" />
                </div>
                <Input name="owner_email" placeholder="E-mail" type="email" required maxLength={255} className="h-10" />
              </div>

              {/* Property info */}
              <h2 className="font-sans font-semibold text-foreground text-sm mb-3">Dados do imóvel</h2>
              <div className="space-y-3 mb-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <select name="purpose" className={selectClass} aria-label="Finalidade" required>
                    <option value="">Finalidade</option>
                    <option value="sale">Venda</option>
                    <option value="rent">Locação</option>
                  </select>
                  <select name="property_type" className={selectClass} aria-label="Tipo do imóvel" required>
                    <option value="">Tipo do imóvel</option>
                    {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <select name="neighborhood" className={selectClass} aria-label="Bairro">
                    <option value="">Bairro</option>
                    {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <Input name="address" placeholder="Endereço completo" maxLength={200} className="h-10" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input name="bedrooms" placeholder="Quartos" type="number" min={0} max={99} className="h-10" />
                  <Input name="bathrooms" placeholder="Banheiros" type="number" min={0} max={99} className="h-10" />
                  <Input name="parking_spots" placeholder="Vagas" type="number" min={0} max={99} className="h-10" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input name="area" placeholder="Área (m²)" type="number" min={0} max={999999} className="h-10" />
                  <Input name="asking_price" placeholder="Valor pretendido (R$)" type="number" min={0} max={999999999} className="h-10" />
                </div>
                <Textarea name="description" placeholder="Descrição e observações sobre o imóvel" rows={3} maxLength={2000} />
              </div>

              <div className="flex items-start gap-2 mb-4">
                <Checkbox id="consent-listing" checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
                <label htmlFor="consent-listing" className="text-[11px] text-muted-foreground leading-tight">
                  Concordo com a <Link to="/privacidade" className="underline text-primary">Política de Privacidade</Link>.
                </label>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar para análise'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Advertise;
