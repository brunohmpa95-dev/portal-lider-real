import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { COMPANY } from '@/data/constants';

const Privacy = () => (
  <Layout>
    <PageHead title="Política de Privacidade" description="Política de privacidade da Líder Imóveis Itaúna. Saiba como tratamos seus dados pessoais." />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Política de Privacidade' }]} />
      <div className="max-w-3xl mx-auto pb-16 prose prose-sm prose-muted">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Política de Privacidade</h1>

        <p className="text-muted-foreground leading-relaxed">A <strong>{COMPANY.fullName}</strong>, inscrita sob o {COMPANY.creci}, com sede em {COMPANY.address}, é comprometida com a proteção da privacidade e dos dados pessoais de seus clientes, visitantes e parceiros, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">1. Dados Coletados</h2>
        <p className="text-muted-foreground">Coletamos dados pessoais fornecidos voluntariamente por você, tais como: nome, e-mail, telefone, CPF/CNPJ e endereço, quando você preenche formulários em nosso site, solicita atendimento ou utiliza nossos serviços.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">2. Finalidade</h2>
        <p className="text-muted-foreground">Os dados coletados são utilizados para: atendimento e comunicação, envio de propostas e informações sobre imóveis, gestão contratual, cumprimento de obrigações legais e melhoria dos nossos serviços.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">3. Compartilhamento</h2>
        <p className="text-muted-foreground">Seus dados podem ser compartilhados com parceiros e prestadores de serviço estritamente necessários para a operação imobiliária, sempre respeitando as bases legais da LGPD.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">4. Segurança</h2>
        <p className="text-muted-foreground">Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou destruição. O acesso é restrito a profissionais autorizados.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">5. Seus Direitos</h2>
        <p className="text-muted-foreground">Você tem direito a acessar, corrigir, eliminar ou solicitar a portabilidade dos seus dados pessoais. Para exercer seus direitos, entre em contato pelo e-mail {COMPANY.email}.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">6. Cookies</h2>
        <p className="text-muted-foreground">Nosso site pode utilizar cookies para melhorar a experiência de navegação. Você pode gerenciar as preferências de cookies nas configurações do seu navegador.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">7. Contato</h2>
        <p className="text-muted-foreground">Para dúvidas sobre esta política, entre em contato: {COMPANY.email} | {COMPANY.phone}</p>

        <p className="text-xs text-muted-foreground mt-12">Última atualização: março de 2026.</p>
      </div>
    </div>
  </Layout>
);

export default Privacy;
