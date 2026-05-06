
# Esteira de Leads — Fase 2 (complementos)

A Fase 1 já entregou: tabelas, função de distribuição, cron de SLA (5min), edge function `lead-distributor`, página `/admin/esteira` com 4 abas, integração no `LeadForm` e seed de SLA padrão de 15min.

Esta fase complementa o que ainda falta para o módulo ser percebido como superior a CRMs imobiliários comuns.

## O que será implementado

### 1. Engine de automações por evento (servidor)
Hoje a tabela `lead_automation_rules` existe mas nada lê dela. Criar:

- Trigger pg em `property_leads` que detecta:
  - INSERT → evento `lead_created`
  - UPDATE de `funnel_stage` → evento `stage_changed` (com from/to)
  - UPDATE de `assigned_to` (de NULL para algo) → `assigned`
- A trigger insere uma linha em uma nova tabela `lead_automation_queue` (fila simples).
- Edge function `lead-automation-runner` lê a fila a cada 1min via cron, casa com `lead_automation_rules` ativas e executa:
  - `create_task` → insere em `tasks`
  - `notify_user` → insere em `notifications`
  - `add_tag` → atualiza `property_leads.tags`
  - `set_priority` → atualiza `priority`
- Cada execução grava `lead_distribution_logs` com `action='automation'`.

### 2. UI de criação de automações
A aba "Automações" hoje só lista. Adicionar dialog completo (mesmo padrão visual do `RuleDialog`):
- evento disparador (select)
- estágio de origem/destino (quando aplicável)
- ação + configuração (título da tarefa, mensagem da notificação, tag, prioridade)
- destinatário (corretor designado, gestor, papel)

### 3. Painel operacional "Leads em risco"
Nova aba na página da Esteira: **"Painel"** (vira a primeira/default). Mostra em tempo real:
- Leads sem atribuição (badge cinza)
- Leads em warning (amarelo) — distribuídos > 10min sem 1ª resposta
- Leads breached (vermelho) — > 15min sem resposta
- Leads parados há 24h+ (sem interação)
Cada card tem: botão "Atribuir agora", "Redistribuir", "Abrir lead". Filtros por corretor, origem, tipo. Atualização via Supabase Realtime na tabela `property_leads`.

### 4. Timeline de SLA no LeadDetail
Adicionar bloco no `LeadDetail` mostrando:
- Status SLA atual (badge colorido)
- Tempo desde distribuição
- Tempo até 1ª resposta (quando ocorreu)
- Histórico de eventos SLA (`lead_sla_events`) e logs de distribuição (`lead_distribution_logs`) intercalados em ordem cronológica.
- Botão "Forçar redistribuição" (para admin/superadmin).

### 5. Realtime + notificações in-app
- Habilitar replicação realtime em `property_leads`, `lead_distribution_logs`, `notifications`.
- Sininho do header já existe — apenas garantir que `notifications` esteja em realtime para tocar atualizações.

### 6. Mobile e UX
- Painel "Leads em risco" sempre em cards (sem versão tabela).
- Filtros em `Sheet` lateral em telas <md.
- Badges SLA com cores semânticas (verde/amarelo/vermelho) consistentes com `index.css`.
- Touch targets ≥44px nos botões de ação rápida.

## Estrutura técnica

```text
DB (migration única):
  + lead_automation_queue (id, lead_id, event_type, payload, processed_at)
  + trigger trg_lead_automation_capture em property_leads
  + ALTER PUBLICATION supabase_realtime ADD TABLE property_leads, lead_distribution_logs
  + permissions: leads.realtime.read

Edge functions:
  + lead-automation-runner (novo) — cron a cada 1min
  + lead-distributor (já existe, sem alteração)

Frontend:
  src/hooks/useEsteira.ts          → adicionar useLeadsAtRisk() com realtime
  src/hooks/useAutomationRules.ts  → já existe via useEsteira
  src/components/admin/SlaBadge.tsx (novo)
  src/components/admin/AutomationDialog.tsx (novo)
  src/pages/admin/AdminEsteira.tsx → adicionar aba Painel + dialog automação
  src/pages/admin/LeadDetail.tsx   → adicionar bloco SLA + timeline
```

## Arquivos previstos

- migration nova
- `supabase/functions/lead-automation-runner/index.ts`
- `supabase/config.toml` (registrar nova função)
- `src/hooks/useEsteira.ts` (estender)
- `src/components/admin/SlaBadge.tsx` (novo)
- `src/components/admin/AutomationDialog.tsx` (novo)
- `src/pages/admin/AdminEsteira.tsx` (estender)
- `src/pages/admin/LeadDetail.tsx` (estender)

## Critério de aceite

- Criar uma regra de automação "Quando lead muda para 'proposta' → criar tarefa ao corretor designado" e ver a tarefa aparecer automaticamente.
- Painel mostrar lead em vermelho ao passar 15min sem resposta, sem precisar recarregar.
- Em 375px: painel utilizável, sem overflow horizontal, ações tocáveis.
- LeadDetail mostrar histórico completo de SLA e distribuição.

## Fora de escopo (próximas fases)

- WhatsApp (Z-API/Meta) — frente separada
- IA de classificação/qualificação — frente separada
- Match engine imóveis ↔ leads — frente separada
- Integração com portais (OLX, Imovelweb) — frente separada
