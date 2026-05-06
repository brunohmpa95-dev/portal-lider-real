## Diagnóstico da modelagem atual

A tabela `property_leads` **já está madura** e cobre quase 100% dos campos pedidos. O que existe hoje:

| Pedido | Status atual |
|---|---|
| id, nome, email, phone | ✅ existe |
| origem (source) | ✅ existe (com 8 opções) |
| interesse (purpose, type, neighborhood, faixa preço, quartos) | ✅ existe (`interest_*`) |
| imóvel vinculado (`property_id`) | ✅ existe |
| corretor responsável (`assigned_to`) | ✅ existe |
| status / funnel_stage / priority | ✅ existe |
| observações (`internal_notes`, `message`) | ✅ existe |
| created_at / updated_at | ✅ existe |
| tags, SLA, distribuição, lost_reason, follow-up | ✅ existe (Fase Esteira) |
| **whatsapp (separado de phone)** | ❌ falta |
| **temperatura (cold/warm/hot)** | ❌ falta (existe só `priority`) |
| **canal vs origem** | ⚠️ hoje fundidos em `source` |
| Tipo `AdminLead` no front | ⚠️ desatualizado (não tem campos novos da Fase Esteira) |
| Hook reutilizável `useLeads` | ❌ não existe (cada página faz query própria) |

## Plano (baixo risco, aditivo)

### 1. Migration — apenas colunas opcionais novas
```sql
ALTER TABLE public.property_leads
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS channel text,           -- canal de captação (ex: form_site, dm_instagram, ligacao)
  ADD COLUMN IF NOT EXISTS temperature text NOT NULL DEFAULT 'cold',
  ADD COLUMN IF NOT EXISTS client_id uuid;         -- vínculo opcional com clients

CREATE INDEX IF NOT EXISTS idx_leads_temperature ON public.property_leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_assigned    ON public.property_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_property    ON public.property_leads(property_id);
```
Tudo nullable / com default → **não quebra inserts existentes**.

### 2. Atualizar `src/types/admin.ts`
- Estender `AdminLead` com os novos campos + os campos da Fase Esteira que faltam (`distributed_at`, `first_response_at`, `last_interaction_at`, `sla_status`, `redistribution_count`, `lost_reason_id`, `lost_at`, `next_followup_at`, `interest_*`).
- Adicionar constantes:
  - `LEAD_TEMPERATURE_OPTIONS` → cold / warm / hot
  - `LEAD_CHANNEL_OPTIONS` → form_site, whatsapp, dm_instagram, dm_facebook, ligacao, presencial, indicacao, portal, outro
- Manter `LEAD_SOURCE_OPTIONS`, `LEAD_FUNNEL_STAGES`, `LEAD_PRIORITY_OPTIONS` já existentes.

### 3. Novo arquivo `src/lib/leads.ts` (helpers puros)
- `temperatureLabel(t)`, `temperatureColor(t)`
- `funnelStageLabel(s)`, `funnelStageColor(s)`
- `sourceLabel(s)`, `channelLabel(c)`
- `formatLeadContact(lead)` — devolve melhor telefone/whatsapp formatado
- `isLeadStale(lead)` — utilitário simples para painel

### 4. Novo hook `src/hooks/useLeads.ts`
- `useLeads(filters?)` — lista com filtros (stage, assigned, temperatura, source, busca por nome/email)
- `useLead(id)` — detalhe único
- `useUpdateLead()` — mutação central (toast + invalidate)
- `useCreateLead()` — chama insert + dispara `lead-distributor`
- Apenas **adiciona** opção. Páginas existentes continuam funcionando com suas queries diretas; podem migrar incrementalmente.

### 5. Atualizar `LeadForm.tsx` minimamente
- Adicionar campos: WhatsApp, Canal, Temperatura.
- Manter resto intacto.
- Continuar usando query direta (não obriga migração para o hook agora).

### 6. NÃO mexer em
- `LeadsList.tsx`, `LeadDetail.tsx`, `BrokerLeads.tsx`, `AdminEsteira.tsx`, `Reports.tsx`, `Dashboard.tsx`, edge functions, RLS, triggers, `apply_distribution_rules`. Tudo continua compatível porque novas colunas têm default/nullable.

## Arquivos que serão alterados
- `supabase/migrations/<novo>.sql` — adicionar colunas + índices
- `src/types/admin.ts` — estender `AdminLead` + 2 novas constantes
- `src/lib/leads.ts` — **novo** helper
- `src/hooks/useLeads.ts` — **novo** hook
- `src/pages/admin/LeadForm.tsx` — 3 campos novos no formulário

## Critérios de aceite
- Páginas existentes continuam abrindo sem erro (tipo é superset).
- Inserir lead sem WhatsApp/Canal/Temperatura ainda funciona (defaults aplicados).
- `useLeads()` disponível para próximas etapas (histórico, funil drag-and-drop).
- Nenhuma RLS, trigger ou edge function tocada.

## Fora de escopo (próximas fases)
- Funil Kanban com drag-and-drop
- Histórico unificado (timeline) — já há `lead_interactions` + `lead_sla_events`; só falta um componente de timeline
- Migração de queries diretas das páginas para o `useLeads`
- WhatsApp/Z-API
