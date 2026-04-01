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
        <h1 className="text-3xl font-sans font-bold text-foreground mb-8">Política de Privacidade</h1>

        <p className="text-muted-foreground leading-relaxed">A <strong>{COMPANY.fullName}</strong>, inscrita sob o {COMPANY.creci}, com sede em {COMPANY.address}, é comprometida com a proteção da privacidade e dos dados pessoais de seus clientes, visitantes e parceiros, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">1. Dados Coletados</h2>
        <p className="text-muted-foreground">Coletamos os seguintes dados pessoais, fornecidos voluntariamente por você através dos formulários do nosso site:</p>
        <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-5">
          <li><strong>Formulário de contato:</strong> nome, e-mail, telefone (opcional), assunto e mensagem.</li>
          <li><strong>Anuncie seu imóvel:</strong> nome, telefone, e-mail, dados do imóvel (endereço, tipo, área, valor).</li>
          <li><strong>Interesse em imóvel:</strong> nome, e-mail, telefone (opcional) e mensagem.</li>
          <li><strong>Ouvidoria:</strong> nome, e-mail, telefone (opcional), tipo de manifestação e mensagem.</li>
          <li><strong>Trabalhe conosco:</strong> nome, e-mail, telefone, área de interesse e experiência profissional.</li>
          <li><strong>Área do cliente:</strong> dados de autenticação (e-mail e senha), nome completo e telefone.</li>
        </ul>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">2. Finalidade e Base Legal</h2>
        <p className="text-muted-foreground">Os dados coletados são utilizados exclusivamente para:</p>
        <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-5">
          <li><strong>Atendimento e comunicação</strong> (base legal: consentimento e execução de contrato);</li>
          <li><strong>Avaliação de imóveis para anúncio</strong> (base legal: consentimento);</li>
          <li><strong>Registro de interesse em imóveis</strong> (base legal: consentimento);</li>
          <li><strong>Análise de manifestações na ouvidoria</strong> (base legal: legítimo interesse);</li>
          <li><strong>Processo seletivo</strong> (base legal: consentimento — dados retidos por até 12 meses);</li>
          <li><strong>Gestão contratual e financeira</strong> (base legal: execução de contrato e obrigação legal);</li>
          <li><strong>Segurança e auditoria</strong> (base legal: legítimo interesse — registramos ações em logs para prevenção de fraude, sem expor dados pessoais nos logs).</li>
        </ul>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">3. Compartilhamento</h2>
        <p className="text-muted-foreground">Seus dados podem ser compartilhados com parceiros e prestadores de serviço estritamente necessários para a operação imobiliária, sempre respeitando as bases legais da LGPD. Não vendemos, alugamos ou compartilhamos seus dados para fins de marketing de terceiros.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">4. Segurança</h2>
        <p className="text-muted-foreground">Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
        <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-5">
          <li>Criptografia em trânsito (HTTPS/TLS) e em repouso;</li>
          <li>Controle de acesso baseado em perfis (RBAC) — cada colaborador acessa apenas os dados necessários;</li>
          <li>Isolamento de dados — clientes só acessam seus próprios documentos e contratos;</li>
          <li>Logs de auditoria para rastreabilidade de acessos;</li>
          <li>Buckets de armazenamento privados com URLs temporárias;</li>
          <li>Validação server-side de todos os formulários com sanitização e rate limiting.</li>
        </ul>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">5. Retenção de Dados</h2>
        <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-5">
          <li><strong>Dados de contato e interesse:</strong> mantidos enquanto o atendimento estiver em andamento, eliminados após 24 meses de inatividade.</li>
          <li><strong>Dados de candidatos (trabalhe conosco):</strong> retidos por até 12 meses após o envio, conforme consentimento.</li>
          <li><strong>Dados contratuais e financeiros:</strong> retidos pelo prazo legal (5 anos após o encerramento do contrato).</li>
          <li><strong>Dados de ouvidoria:</strong> retidos pelo prazo legal ou até resolução definitiva.</li>
          <li><strong>Logs de auditoria:</strong> retidos por 12 meses para fins de segurança.</li>
        </ul>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">6. Seus Direitos</h2>
        <p className="text-muted-foreground">Conforme a LGPD, você tem direito a:</p>
        <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-5">
          <li>Confirmar a existência de tratamento dos seus dados;</li>
          <li>Acessar seus dados pessoais;</li>
          <li>Corrigir dados incompletos ou desatualizados;</li>
          <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Solicitar portabilidade dos dados;</li>
          <li>Revogar o consentimento a qualquer momento;</li>
          <li>Apresentar reclamação à ANPD (Autoridade Nacional de Proteção de Dados).</li>
        </ul>
        <p className="text-muted-foreground">Para exercer seus direitos, entre em contato pelo e-mail <strong>{COMPANY.email}</strong> com o assunto "LGPD - [seu pedido]".</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">7. Cookies</h2>
        <p className="text-muted-foreground">Nosso site utiliza apenas cookies essenciais para funcionamento (autenticação e sessão). Não utilizamos cookies de rastreamento de terceiros. Você pode gerenciar as preferências de cookies nas configurações do seu navegador.</p>

        <h2 className="font-sans text-lg font-semibold text-foreground mt-8 mb-3">8. Encarregado de Dados (DPO)</h2>
        <p className="text-muted-foreground">Para dúvidas sobre esta política ou sobre o tratamento de dados pessoais, entre em contato com nosso encarregado de dados: {COMPANY.email} | {COMPANY.phone}</p>

        <p className="text-xs text-muted-foreground mt-12">Última atualização: abril de 2026.</p>
      </div>
    </div>
  </Layout>
);

export default Privacy;
