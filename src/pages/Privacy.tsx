import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/shared/BreadcrumbsJsonLd';
import { COMPANY } from '@/data/constants';
import { Database, Target, UserCheck, Mail } from 'lucide-react';

const summary = [
  { icon: Database, title: 'O que coletamos', text: 'Apenas dados necessários ao atendimento: nome, contato, dados do imóvel e mensagens.' },
  { icon: Target, title: 'Para que usamos', text: 'Atender você, intermediar negociações e cumprir obrigações contratuais e legais.' },
  { icon: UserCheck, title: 'Seus direitos', text: 'Acessar, corrigir, eliminar, portar dados e revogar o consentimento a qualquer momento.' },
  { icon: Mail, title: 'Encarregado (DPO)', text: `Solicitações por e-mail: ${COMPANY.email} — assunto "LGPD".` },
];

const sections = [
  { id: 'dados', label: '1. Dados Coletados' },
  { id: 'finalidade', label: '2. Finalidade e Base Legal' },
  { id: 'compartilhamento', label: '3. Compartilhamento' },
  { id: 'seguranca', label: '4. Segurança' },
  { id: 'retencao', label: '5. Retenção de Dados' },
  { id: 'direitos', label: '6. Seus Direitos' },
  { id: 'cookies', label: '7. Cookies' },
  { id: 'dpo', label: '8. Encarregado de Dados' },
];

const Privacy = () => (
  <Layout>
    <PageHead
      title="Política de Privacidade"
      description="Política de privacidade da Líder Imóveis Itaúna em conformidade com a LGPD. Saiba como tratamos seus dados pessoais."
      canonical="/privacidade"
    />
    <BreadcrumbsJsonLd items={[{ name: 'Política de Privacidade', path: '/privacidade' }]} />
    <div className="container mx-auto px-4">
      <Breadcrumbs items={[{ label: 'Política de Privacidade' }]} />
      <div className="max-w-3xl mx-auto pb-12">
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-6">Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {summary.map(s => (
            <div key={s.title} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <s.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <div>
                <p className="font-sans font-semibold text-foreground text-sm mb-0.5">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Index */}
        <nav aria-label="Índice" className="bg-secondary/40 rounded-lg p-4 mb-8">
          <p className="text-xs font-semibold text-foreground mb-2">Índice</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {sections.map(s => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-primary hover:underline">{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p>A <strong className="text-foreground">{COMPANY.fullName}</strong>, inscrita sob o {COMPANY.creci}, com sede em {COMPANY.address}, é comprometida com a proteção da privacidade e dos dados pessoais de seus clientes, visitantes e parceiros.</p>

          <section id="dados">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">1. Dados Coletados</h2>
            <p className="mb-2">Coletamos os seguintes dados pessoais, fornecidos voluntariamente por você:</p>
            <ul className="space-y-1 list-disc pl-5 text-xs">
              <li><strong>Contato:</strong> nome, e-mail, telefone, assunto e mensagem.</li>
              <li><strong>Anuncie:</strong> nome, telefone, e-mail, dados do imóvel.</li>
              <li><strong>Interesse em imóvel:</strong> nome, e-mail, telefone e mensagem.</li>
              <li><strong>Ouvidoria:</strong> nome, e-mail, telefone, tipo e mensagem.</li>
              <li><strong>Trabalhe conosco:</strong> nome, e-mail, telefone, área de interesse e experiência.</li>
              <li><strong>Área do cliente:</strong> dados de autenticação, nome e telefone.</li>
            </ul>
          </section>

          <section id="finalidade">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">2. Finalidade e Base Legal</h2>
            <ul className="space-y-1 list-disc pl-5 text-xs">
              <li><strong>Atendimento e comunicação</strong> — consentimento e execução de contrato.</li>
              <li><strong>Avaliação de imóveis</strong> — consentimento.</li>
              <li><strong>Registro de interesse</strong> — consentimento.</li>
              <li><strong>Ouvidoria</strong> — legítimo interesse.</li>
              <li><strong>Processo seletivo</strong> — consentimento (retidos por até 12 meses).</li>
              <li><strong>Gestão contratual</strong> — execução de contrato e obrigação legal.</li>
              <li><strong>Segurança e auditoria</strong> — legítimo interesse.</li>
            </ul>
          </section>

          <section id="compartilhamento">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">3. Compartilhamento</h2>
            <p>Seus dados podem ser compartilhados com parceiros estritamente necessários para a operação imobiliária, respeitando a LGPD. Não vendemos, alugamos ou compartilhamos seus dados para marketing de terceiros.</p>
          </section>

          <section id="seguranca">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">4. Segurança</h2>
            <ul className="space-y-1 list-disc pl-5 text-xs">
              <li>Criptografia em trânsito (HTTPS/TLS) e em repouso.</li>
              <li>Controle de acesso baseado em perfis (RBAC).</li>
              <li>Isolamento de dados — clientes acessam apenas seus próprios dados.</li>
              <li>Logs de auditoria para rastreabilidade.</li>
              <li>Validação server-side com sanitização e rate limiting.</li>
            </ul>
          </section>

          <section id="retencao">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">5. Retenção de Dados</h2>
            <ul className="space-y-1 list-disc pl-5 text-xs">
              <li><strong>Contato e interesse:</strong> eliminados após 24 meses de inatividade.</li>
              <li><strong>Candidatos:</strong> retidos por até 12 meses.</li>
              <li><strong>Contratuais e financeiros:</strong> 5 anos após encerramento.</li>
              <li><strong>Ouvidoria:</strong> até resolução definitiva.</li>
              <li><strong>Auditoria:</strong> 12 meses.</li>
            </ul>
          </section>

          <section id="direitos">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">6. Seus Direitos</h2>
            <p className="mb-2">Conforme a LGPD, você pode:</p>
            <ul className="space-y-1 list-disc pl-5 text-xs">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar, corrigir ou solicitar eliminação dos seus dados.</li>
              <li>Solicitar portabilidade ou anonimização.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Apresentar reclamação à ANPD.</li>
            </ul>
            <p className="mt-2">Para exercer seus direitos: <strong>{COMPANY.email}</strong> — assunto "LGPD".</p>
          </section>

          <section id="cookies">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">7. Cookies</h2>
            <p>Utilizamos apenas cookies essenciais (autenticação e sessão). Não usamos cookies de rastreamento de terceiros.</p>
          </section>

          <section id="dpo">
            <h2 className="font-sans text-base font-semibold text-foreground mb-2">8. Encarregado de Dados</h2>
            <p>Para dúvidas sobre esta política: {COMPANY.email} | {COMPANY.phone}</p>
          </section>

          <p className="text-[10px] text-muted-foreground/60 pt-4">Última atualização: abril de 2026.</p>
        </div>
      </div>
    </div>
  </Layout>
);

export default Privacy;
