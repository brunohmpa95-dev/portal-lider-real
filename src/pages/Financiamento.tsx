import { Link } from 'react-router-dom';
import { ExternalLink, FileText, CheckCircle2, Calculator, Home, Phone, ArrowRight, FileCheck2, ShieldCheck } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import BreadcrumbsJsonLd from '@/components/shared/BreadcrumbsJsonLd';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import FaqSection from '@/components/shared/FaqSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { COMPANY } from '@/data/constants';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const steps = [
  {
    n: 1,
    title: 'Simule seu financiamento',
    text: 'Use o simulador oficial da CAIXA para descobrir o valor da parcela, taxa e prazo de acordo com sua renda.',
  },
  {
    n: 2,
    title: 'Separe sua documentação',
    text: 'Reúna documentos pessoais, comprovantes de renda e residência. Nosso time orienta tudo de perto.',
  },
  {
    n: 3,
    title: 'Escolha o imóvel certo',
    text: 'Selecionamos imóveis em Itaúna que se encaixam no seu perfil de financiamento e nas regras do banco.',
  },
  {
    n: 4,
    title: 'Análise e aprovação no banco',
    text: 'Acompanhamos a análise de crédito, avaliação do imóvel e a aprovação da sua proposta junto ao banco.',
  },
  {
    n: 5,
    title: 'Assinatura e chaves',
    text: 'Cuidamos do contrato, do registro em cartório e da entrega das chaves do seu novo imóvel.',
  },
];

const docsBuyer = [
  'RG e CPF (ou CNH) do comprador e cônjuge',
  'Certidão de nascimento ou casamento atualizada',
  'Comprovante de residência atual',
  'Comprovantes de renda (3 últimos contracheques, IRPF ou DECORE)',
  'Extratos bancários dos últimos 3 meses',
  'Carteira de trabalho ou contrato social (autônomos/PJ)',
];

const docsProperty = [
  'Matrícula atualizada do imóvel (até 30 dias)',
  'IPTU do ano vigente quitado',
  'Certidão negativa de débitos do imóvel',
  'Habite-se ou averbação da construção',
  'Documentos pessoais do vendedor',
];

const financingFaq = [
  {
    q: 'Posso financiar 100% do valor do imóvel?',
    a: 'Geralmente os bancos financiam de 70% a 80% do valor do imóvel. O restante deve ser pago como entrada. Em alguns programas e perfis específicos, esse percentual pode variar.',
  },
  {
    q: 'Quanto preciso ter de renda para financiar?',
    a: 'A regra geral é que a parcela do financiamento não ultrapasse 30% da renda familiar bruta. O simulador da CAIXA mostra o valor exato com base na sua situação.',
  },
  {
    q: 'Posso usar o FGTS na compra?',
    a: 'Sim. O FGTS pode ser usado como entrada, para amortizar o saldo devedor ou abater parcelas, desde que o imóvel atenda às regras do programa.',
  },
  {
    q: 'Quais bancos vocês atendem?',
    a: 'Trabalhamos principalmente com a CAIXA Econômica Federal, que oferece as melhores condições para financiamento imobiliário, incluindo o programa Minha Casa Minha Vida.',
  },
  {
    q: 'Quanto tempo leva todo o processo de financiamento?',
    a: 'Em média, de 30 a 60 dias entre a aprovação do crédito, avaliação do imóvel, análise da documentação e assinatura do contrato.',
  },
  {
    q: 'A Líder Imóveis cobra alguma taxa pelo financiamento?',
    a: 'Não cobramos taxa pela orientação e acompanhamento do financiamento. Os custos envolvidos são os do próprio banco e cartório (ITBI, registro, escritura).',
  },
  {
    q: 'Posso financiar imóvel usado?',
    a: 'Sim, tanto imóveis novos quanto usados podem ser financiados, desde que estejam regulares e dentro dos critérios técnicos exigidos pelo banco.',
  },
];

const Financiamento = () => {
  const wppLink = buildWhatsAppLink('speak');

  return (
    <Layout>
      <PageHead
        title="Financiamento Imobiliário em Itaúna"
        description="Simule e financie seu imóvel em Itaúna com a CAIXA. Veja o passo a passo, documentos necessários e fale com um especialista da Líder Imóveis."
        keywords="financiamento imobiliário Itaúna, simulador CAIXA, financiar casa Itaúna, MCMV Itaúna, FGTS imóvel"
        canonical="/financiamento"
      />
      <BreadcrumbsJsonLd items={[{ name: 'Financiamento', path: '/financiamento' }]} />

      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[{ label: 'Financiamento' }]} />
      </div>

      {/* Hero */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Parceiro CAIXA
          </span>
          <h1 className="text-2xl md:text-4xl font-sans font-bold text-foreground mb-3">
            Financie seu imóvel em Itaúna com segurança
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Simule pelo banco, organize seus documentos e conte com nossa equipe para conduzir todo o processo até a entrega das chaves.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#005CA9' }}
            >
              <Calculator className="h-4 w-4" /> Simular na CAIXA <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href={wppLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                <Phone className="h-4 w-4" /> Falar com especialista
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Passo a passo */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">
              Como funciona o financiamento, passo a passo
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Um caminho claro do primeiro cálculo até a chave na sua mão.
            </p>
          </div>
          <ol className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((s) => (
              <li key={s.n} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {s.n}
                  </span>
                  <h3 className="font-sans font-semibold text-foreground text-base">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Documentos */}
      <section className="py-12 md:py-16 bg-secondary/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-sans font-semibold text-foreground mb-2">
              Documentos necessários
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Lista geral. A relação final depende do banco e do tipo de financiamento.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  <h3 className="font-sans font-semibold text-foreground">Do comprador</h3>
                </div>
                <ul className="space-y-2.5">
                  {docsBuyer.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-sans font-semibold text-foreground">Do imóvel</h3>
                </div>
                <ul className="space-y-2.5">
                  {docsProperty.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection
        items={financingFaq}
        title="Dúvidas sobre financiamento"
        subtitle="Reunimos as perguntas mais comuns de quem está financiando um imóvel em Itaúna."
      />

      {/* CTA final */}
      <section className="py-14 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-xl md:text-2xl font-sans font-semibold mb-3">
            Pronto para encontrar o imóvel ideal?
          </h2>
          <p className="text-primary-foreground/80 mb-6 text-sm sm:text-base">
            Veja nossas opções para venda em Itaúna ou fale agora com nosso time para acelerar a aprovação do seu financiamento.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/comprar">
              <Button variant="secondary" size="lg" className="gap-2">
                <Home className="h-4 w-4" /> Ver imóveis à venda <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href={wppLink} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Phone className="h-4 w-4" /> Falar no WhatsApp
              </Button>
            </a>
          </div>
          <p className="text-primary-foreground/70 text-xs mt-6">
            {COMPANY.fullName} · {COMPANY.creci}
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Financiamento;
