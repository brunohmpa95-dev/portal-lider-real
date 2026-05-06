
# Diagnóstico Real do CRM Líder (baseado no código atual)

Análise feita lendo migrations, rotas, hooks, edge functions e páginas. **Não foi assumido nada com base em planos anteriores.**

---

## 1. Diagnóstico por módulo

### 1.1 CRM — Leads, Contatos e Clientes
**Status:** Implementado (núcleo) | Parcial (clientes)

- Tabelas: `property_leads`, `lead_interactions`, `lead_lost_reasons`, `clients`, `profiles` ✅
- Páginas: `LeadsList.tsx` (455 linhas, com Kanban + tabela), `LeadForm.tsx`, `LeadDetail.tsx` (401 linhas), `AdminClients.tsx` (112 linhas) ✅
- Hooks: `useLeadStats.ts`, `useLostReasons.ts` ✅
- Edge functions ligadas: nenhuma específica
- **Problemas:** `AdminClients` é listagem simples sem detalhe/edição; não há vínculo automático de lead→cliente.

### 1.2 Funil de Vendas
**Status:** Implementado

- Kanban drag-and-drop em desktop + accordion em mobile (`LeadsList.tsx` 255-317).
- Validação de "perdido" via trigger `validate_lead_lost` + tabela `lead_lost_reasons` ✅
- Stages: new → contact → visit → proposal → negotiation → closed/lost ✅

### 1.3 Imóveis Compatíveis / Perfil de Busca
**Status:** Apenas planejado / não implementado

- Tabela `property_leads` tem campos `interest_*` (bedrooms, price, neighborhood, type, purpose) ✅
- **Não existe:** match engine, página de "imóveis compatíveis", hook ou função SQL que cruze interesse × imóveis. Nenhuma referência a "match" no código.

### 1.4 WhatsApp integrado ao CRM
**Status:** NÃO implementado (apenas link wa.me)

- `src/lib/whatsapp.ts` apenas monta links `wa.me?text=…`.
- Componente `WhatsAppButton.tsx` é botão flutuante no site público.
- **Não existe:** tabela `whatsapp_messages`, edge function de webhook, integração com Z-API/Twilio/Meta, histórico de conversas no CRM.

### 1.5 Distribuição de Leads e Automações
**Status:** NÃO implementado

- Sem tabelas `lead_distribution_rules`, `automation_rules`, `sla_*`.
- Sem edge function de distribuição/round-robin.
- Sem cron de SLA / lead parado.
- Há apenas `assigned_to` manual no lead. Plano técnico anterior nunca chegou a virar migration.

### 1.6 Integrações com Portais (ZAP, VivaReal, OLX…)
**Status:** NÃO implementado

- Sem tabelas `portals`, `property_publications`, `portal_sync_logs`.
- Sem edge function de exportação XML/JSON.
- Sem painel de status de publicação. Plano técnico não foi codificado.

### 1.7 IA aplicada (descrição, título, resumo, sugestões)
**Status:** NÃO implementado

- `LOVABLE_API_KEY` está configurado nos secrets ✅
- Sem edge function que chame `ai.gateway.lovable.dev`.
- Sem botões "Gerar com IA" em `PropertyForm` ou `LeadDetail`.
- Sem coluna `ai_generated` ou `ai_metadata` em nenhuma tabela.

### 1.8 Governança, Permissões e Auditoria
**Status:** Implementado (estrutura) | Parcial (UX)

- Tabelas `permissions` (37 seeds), `role_permissions`, `audit_log` ✅
- Funções `has_permission`, `get_my_permissions`, `log_audit`, `audit_critical_changes` ✅
- Triggers de auditoria em `properties`, `property_leads (delete)`, `commissions`, `finance_transactions`, `user_roles`, `role_permissions` ✅
- Páginas: `AdminPermissions.tsx` (101 linhas — matriz role×permission), `AdminAudit.tsx` (88 linhas) ✅
- Hook `usePermissions` + `PermissionGuard` ✅
- **Problemas:** rota `/admin/permissoes` não está registrada em `App.tsx` (existe no menu mas não no router) ❌ — link quebrado. `AdminAudit` é tabela simples, sem filtros por usuário/ação/período.

### 1.9 Relatórios, Dashboards e Financeiro
**Status:** Parcial

- **Relatórios:** `Reports.tsx` (196 linhas) carrega dados do client com Recharts ✅. Edge function `generate-report` existe mas **não está sendo chamada pelo frontend** — nenhum botão de export usa ela.
- **Dashboard Gerencial:** rota `/admin/gestao` está no menu (`admin-nav.ts:70`) mas **não existe página nem rota** ❌
- **Financeiro:** `AdminFinancial.tsx` (94 linhas) mostra apenas comissões. Tabelas novas `finance_accounts`, `finance_categories`, `finance_transactions`, `finance_recurring` existem com RLS por permissão ✅, mas **sem UI** — nenhuma tela cria/lista transações, contas ou recorrências. Hook `useFinance` existe mas não é usado.
- Sem cron de recorrências; sem export CSV ligado.

### 1.10 Navegação Administrativa
**Status:** Implementado (com bugs)

- 5 seções (Operacional/Comercial/Financeiro/Gestão/Sistema) ✅
- **Bugs:**
  - Link "Permissões" → `/admin/permissoes` não existe no router → 404
  - Link "Dashboard Gerencial" → `/admin/gestao` não existe → 404
  - `getBreadcrumbs` em `AdminLayout` não tem entradas para `/admin/permissoes`, `/admin/auditoria`, `/admin/financeiro`, `/admin/tarefas`, `/admin/bairros` (mostra breadcrumb vazio)

### 1.11 Áreas paralelas
- **Cliente** (`/cliente/*`): 8 páginas implementadas, listagens simples ✅
- **Corretor Parceiro** (`/parceiro/*`): 7 páginas, mas todas com 58–134 linhas — são **esqueletos funcionais mínimos** (lista básica, sem detalhe, sem ações).

---

## 2. Mobile — Análise (375–390px)

| Página | Tabela | Cards mobile? | Risco |
|---|---|---|---|
| LeadsList | sim | **sim** (kanban→accordion) | OK |
| PropertiesList (615 linhas) | 25× table | parcial | precisa revisar |
| AdminFinancial | 1 tabela, 1× overflow | não | scroll horizontal |
| AdminContracts | 1 tabela, 1× overflow | não | scroll horizontal |
| AdminBrokers | 1 tabela | não | scroll horizontal |
| AdminClients | 1 tabela | não | scroll horizontal |
| AdminTickets | 1 tabela | não | scroll horizontal |
| AdminAudit | 1 tabela | não | scroll horizontal |
| AdminPermissions | matriz role×permission | não | **quebra forte** em 375px |
| AdminDocuments | 1 tabela | não | scroll horizontal |
| Neighborhoods | 18 tables | parcial | revisar |
| Team | 15 tables | parcial | revisar |
| Dashboard | gráficos Recharts | ResponsiveContainer | OK em altura, KPIs precisam grid 2-col |
| AdminLayout header | input "Buscar" hidden md+ | OK | trigger sidebar pequeno (44px touch?) |

**Problemas mobile específicos:**
- Sidebar admin usa `Sidebar` do shadcn — em mobile vira sheet, OK; mas trigger no header é `Menu` icon sem padding suficiente (touch target < 44px).
- `AdminPermissions`: matriz fixa de colunas (7 roles × 37 perms) sem versão em accordion → **inutilizável em 375px**.
- Filtros (`LeadsList`, `PropertiesList`) ficam em linha, podem estourar.
- Modais (`LostReasonDialog`, `TaskFormDialog`, `DocumentUploadDialog`) usam `Dialog` shadcn — em mobile precisam virar `Sheet` ou ter padding/scroll.
- Cards de KPI no Dashboard: grid não otimizado para 2 colunas em 375px.
- `Reports.tsx`: gráficos Recharts podem ter labels cortados em 375px (não há `tickFormatter` curto).

---

## 3. Lista do que está PRONTO

- Auth + RBAC (7 roles) + RLS em todas as 35 tabelas
- Funil de leads com Kanban e validação de perda
- CRUD de imóveis + import + upload de imagens
- Páginas Cliente (8) e Corretor Parceiro (7 esqueletos)
- Tabelas + funções de permissões/auditoria
- Edge function `generate-report` (criada, não consumida)
- Matriz de permissões (`AdminPermissions`)
- 4 tabelas financeiras novas com RLS por permissão
- Hooks `useFinance`, `usePermissions`, `useLeadStats`, `useTasks`

## 4. Lista do que está INCOMPLETO

1. Rota `/admin/permissoes` ausente do router → menu quebrado
2. Rota `/admin/gestao` ausente — página Dashboard Gerencial nunca criada
3. `AdminFinancial` mostra só comissões — não usa as 4 tabelas novas nem `useFinance`
4. `Reports.tsx` não usa edge function `generate-report` (sem export CSV)
5. `AdminAudit` sem filtros (usuário/ação/período/tabela)
6. Breadcrumbs ausentes para várias rotas
7. `AdminClients` sem detalhe/edição
8. Páginas Corretor Parceiro são esqueletos (sem detalhe/ações)
9. Mobile: 8 páginas administrativas só com `overflow-x-auto` (sem cards mobile)
10. `AdminPermissions` quebra em 375px

## 5. Lista do que NÃO existe (planejado e nunca codificado)

- WhatsApp integrado (webhook, histórico, envio)
- Distribuição automática de leads (rodízio, região, valor, tipo)
- SLA + alerta de lead parado (cron)
- Match engine "imóveis compatíveis"
- Integrações com portais (ZAP, VivaReal, OLX) + painel
- IA: gerar descrição, título, melhorar texto, extrair dados, sugestões
- Cron de recorrências financeiras
- Logs de regras automáticas (`automation_logs`)
- Notificações in-app dirigidas por automação
- API pública / chaves para parceiros

---

## 6. Lista priorizada de correções e desenvolvimento

### P0 — Críticas (links quebrados / dados invisíveis)
1. Registrar rota `/admin/permissoes` em `App.tsx`
2. Criar página `Dashboard Gerencial` (`/admin/gestao`) ou remover link do menu
3. Completar UI do Financeiro: lançamentos, categorias, contas, recorrências (usar `useFinance`)
4. Conectar botões de export CSV em `Reports.tsx` à edge function `generate-report`
5. Adicionar breadcrumbs faltantes em `AdminLayout.getBreadcrumbs`

### P1 — Mobile / estabilidade
6. `AdminPermissions`: versão mobile em accordion (uma role por vez)
7. Converter para padrão "tabela desktop + cards mobile" as 8 páginas listadas
8. Touch targets ≥ 44px (SidebarTrigger, botões de ação em tabelas)
9. Modais que viram `Sheet` bottom em mobile (LostReason, Task, DocumentUpload)
10. Filtros de `LeadsList`/`PropertiesList` colapsáveis em mobile
11. KPIs `grid-cols-2` em <640px no Dashboard

### P2 — Acabamento e auditoria
12. `AdminAudit`: filtros (usuário, ação, tabela, período) + paginação
13. `AdminClients`: tela de detalhe + edição
14. Páginas Corretor Parceiro: completar detalhes mínimos (visita, proposta, comissão)

### P3 — Novos módulos (grandes; cada um vira etapa própria)
15. **Distribuição & Automações** (tabelas + cron + logs)
16. **IA** (edge function + botões nos forms)
17. **Match engine** (função SQL + página)
18. **Portais** (tabelas + 1 exportador XML inicial)
19. **WhatsApp** (definir provedor antes; precisa secret + webhook)

---

## 7. Plano de ação — próxima etapa proposta

Recomendo executar **uma única etapa de "Estabilização + Mobile"** antes de qualquer novo módulo. Escopo dessa próxima entrega:

### Etapa: Estabilização P0 + Mobile P1

**Backend / rotas**
- Registrar rota `/admin/permissoes` → `AdminPermissions`
- Criar `src/pages/admin/AdminGestao.tsx` (Dashboard Gerencial: KPIs leads/imóveis/receita, top corretores, top bairros, conversão por funil) + rota `/admin/gestao`
- Adicionar entradas faltantes em `getBreadcrumbs`

**Financeiro completo**
- Expandir `AdminFinancial.tsx` com tabs: Resumo (KPIs + fluxo de caixa), Lançamentos (CRUD `finance_transactions`), Categorias, Contas, Recorrências, Comissões (atual)
- Botão "Confirmar pagamento" / "Marcar pago"
- Export CSV via `generate-report`

**Relatórios**
- Adicionar botão "Exportar CSV" em cada gráfico de `Reports.tsx` chamando `supabase.functions.invoke('generate-report', { body: { type, format: 'csv' } })`
- Adicionar filtro de período (7/30/90/365 dias)

**Auditoria com filtros**
- `AdminAudit`: filtros por ação/tabela/usuário/período + paginação 50 itens

**Mobile (375–390px)**
- `AdminPermissions`: versão accordion role-a-role abaixo de `md`
- Padrão "tabela em md+ / cards em <md" aplicado em: AdminFinancial, AdminContracts, AdminBrokers, AdminClients, AdminTickets, AdminAudit, AdminDocuments
- KPIs Dashboard: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- SidebarTrigger e botões de ação em tabelas com `min-h-11 min-w-11`
- Filtros colapsáveis (Sheet bottom) em LeadsList/PropertiesList <md
- Modais grandes (TaskFormDialog, DocumentUploadDialog) com `max-h-[90dvh] overflow-y-auto`

**Auditoria visual obrigatória**
- Após implementação, abrir cada página em 375px e validar zero scroll horizontal.

### Arquivos que serão alterados/criados (estimativa)
- `src/App.tsx` (rotas)
- `src/components/admin/AdminLayout.tsx` (breadcrumbs + touch targets)
- `src/pages/admin/AdminGestao.tsx` (novo)
- `src/pages/admin/AdminFinancial.tsx` (reescrita com tabs)
- `src/pages/admin/Reports.tsx` (export)
- `src/pages/admin/AdminAudit.tsx` (filtros)
- `src/pages/admin/AdminPermissions.tsx` (mobile)
- `src/pages/admin/AdminContracts.tsx`, `AdminBrokers.tsx`, `AdminClients.tsx`, `AdminTickets.tsx`, `AdminDocuments.tsx` (cards mobile)
- `src/pages/admin/Dashboard.tsx` (grid KPI)
- Componentes novos: `src/components/admin/MobileTableCard.tsx`, `src/components/admin/FinanceTransactionDialog.tsx`

---

## Por que esta ordem

1. **Funcionamento real:** corrigir links 404 e completar Financeiro/Relatórios libera valor já investido.
2. **Estabilidade:** sem novos módulos, sem novos bugs.
3. **Mobile:** padrão reusável (`MobileTableCard`) acelera próximas etapas.
4. **Acabamento:** breadcrumbs + filtros + touch targets dão sensação de produto pronto.

Depois disso, o próximo grande módulo recomendado é **Distribuição & Automações** (puramente backend + uma página de regras), pois desbloqueia operação comercial real, antes de IA/Portais/WhatsApp que dependem de provedores externos.
