
# Plano: Correções + Implementação Fase 3 CRM

## Auditoria curta

| Item | Status real | Ação |
|---|---|---|
| Bug /anuncie | **Já corrigido** (usa `useNeighborhoodNames`) | Apenas validar fallback de loading |
| 4 bairros pendentes | 1 imóvel cada, source `legacy-data` | Validar via web e marcar |
| `user_roles` "0 ativos" | Falso alarme — 2 superadmins ok | Sem ação (criar role para usuários novos quando existirem) |
| Fase 3 CRM | Não implementada | Implementar completa |
| Status do imóvel | 6 valores, faltam 2 | Expandir para 8 padronizados |

## Parte 1 — Correções

**1.1 Bairros pendentes** — pesquisa web rápida (Wikipedia/prefeitura) e atualizo via SQL:
- **Santo Antônio** → bairro real de Itaúna → `verified=true`
- **Alvorada** → bairro real → `verified=true`
- **Vila Romana** → bairro real → `verified=true`
- **Residencial Morro Verde** → loteamento/condomínio fechado, não bairro oficial → renomear para "Morro Verde" se confirmado, senão `verified=true` mantendo o nome (já tem 1 imóvel vinculado). Vou validar e decidir antes de aplicar.

**1.2 Fallback de loading no /anuncie e SearchBar** — placeholder "Carregando bairros..." quando `isLoading`.

**1.3 Migração:** garantir consistência de grafia entre `properties.neighborhood` e `neighborhoods.name`.

## Parte 2 — Fase 3 CRM (implementação completa)

### Migrações SQL
- **Expandir `property_leads`**: adicionar `interest_purpose, interest_property_type, interest_neighborhood_id, interest_min_price, interest_max_price, interest_bedrooms, next_followup_at, lost_reason_id, lost_notes, lost_at`
- **Nova tabela `lead_lost_reasons`**: id, name, description, is_active, sort_order — RLS leitura interna, escrita admin. Seed: Preço alto, Localização, Sem retorno, Escolheu concorrente, Fora do perfil, Crédito negado, Desistiu, Outro.
- **Nova tabela `tasks`**: id, title, description, due_at, status (`pending|done|cancelled`), priority (`low|normal|high|urgent`), assigned_to, created_by, lead_id, client_profile_id, property_id, contract_id, completed_at. RLS: dono ou admin lê/edita; criação por internos.
- **Trigger `validate_lead_lost`** em `property_leads BEFORE UPDATE`: se `funnel_stage='lost'` exige `lost_reason_id`; preenche `lost_at=now()` automaticamente.
- **Expandir status do imóvel** em `PROPERTY_STATUS_OPTIONS`: adicionar `captacao` e `aguardando_documentacao`. Sem migração SQL necessária (campo é text).

### Frontend
- **`LeadForm.tsx`**: nova seção "Interesse do cliente" (finalidade, tipo, bairro via combobox, faixa de preço, quartos, próximo follow-up).
- **`LeadDetail.tsx`**: card de interesse + card de tarefas vinculadas + próximo follow-up no header.
- **`LeadsList.tsx` Kanban**: `LostReasonDialog` modal obrigatório quando arrasta para "Perdido"; bloqueia drop sem motivo.
- **`PropertyForm.tsx` + `PropertiesList.tsx`**: usar `PROPERTY_STATUS_OPTIONS` expandida; badges com cores.
- **Nova rota `/admin/tarefas`** (`AdminTasks.tsx`): listagem com filtros tabs (minhas | equipe | atrasadas | hoje | próximos 7 dias), criar/editar/concluir tarefas.
- **Dashboard (`Dashboard.tsx`)**: 
  - Widget "Pendências" (tarefas vencidas + follow-ups vencidos + leads sem atividade > 7d)
  - Funil de conversão (barras por etapa) + filtro 7/30/90 dias
  - Tempo médio por etapa
  - Top 5 motivos de perda
- **Hooks novos**: `useTasks`, `useLostReasons`, `useLeadStats`.
- **`admin-nav.ts`**: adicionar item "Tarefas" e "Bairros" (já existe).

## Parte 3 — Revisão final

- Compilar TS sem erros
- Testar /anuncie, /comprar, /admin/leads (Kanban), /admin/tarefas
- Validar que bairros aparecem em todos os selects
- Confirmar que arrastar lead para "Perdido" sem motivo é bloqueado
- Verificar dashboards renderizam mesmo sem dados

## Restrições respeitadas
- Sem alterar RLS existente • sem remover páginas • sem inventar bairros • sem quebrar SEO • TS continua compilando
