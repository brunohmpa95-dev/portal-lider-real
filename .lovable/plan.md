## 1. Validação dos leads auto-criados pelo site

Comparei o `insert` atual em `supabase/functions/form-submit/index.ts` com o schema real de `public.property_leads` e com os enums do frontend (`src/types/admin.ts`).

**OK (campos válidos):**
- `name`, `email`, `phone`, `whatsapp`, `message` → colunas existem, tipos batem.
- `status: 'new'` → coluna NOT NULL, default `'new'`. ✔
- `funnel_stage: 'new'` → coluna NOT NULL, default `'new'`. ✔
- `temperature: 'hot'` → coluna NOT NULL, valor presente em `LEAD_TEMPERATURE_OPTIONS`. ✔
- `priority: 'urgent'` → coluna NOT NULL, valor presente em `LEAD_PRIORITY_OPTIONS`. ✔
- `property_id` (somente quando UUID válido). ✔

**Inconsistências a corrigir:**
- `source: 'website_contact'` **não existe** em `LEAD_SOURCE_OPTIONS` (valores válidos: `website`, `whatsapp`, `phone`, `referral`, `social`, `portal`, `walk_in`, `other`). O filtro "Origem" da listagem nunca vai pegar esses leads.
  → trocar para `source: 'website'` e diferenciar via `channel`.
- `channel: 'website'` **não existe** em `LEAD_CHANNEL_OPTIONS` (válidos: `form_site`, `whatsapp`, `dm_instagram`, ...). Filtro "Canal" também ignora.
  → usar `channel: 'form_site'` nos dois blocos (contact e property_lead).

Após o ajuste, os leads aparecem corretamente nos filtros do Kanban/Tabela e nos relatórios.

## 2. Ação em massa: alterar etapa/status

Em `src/pages/admin/LeadsList.tsx`:

- Adicionar um segundo botão na barra de ações em massa (ao lado de "Excluir selecionados"): **"Mudar etapa"**.
- Botão abre um `AlertDialog` único com:
  - `Select` listando `LEAD_FUNNEL_STAGES` **exceto** `lost` (perda exige motivo via `LostReasonDialog`, fluxo individual já existente) e `closed` (ganho costuma exigir vínculo a proposta).
  - Texto: "Mover N leads para a etapa X?"
  - Botões "Cancelar" / "Confirmar".
- Ao confirmar: `supabase.from('property_leads').update({ funnel_stage: X, updated_at: now() }).in('id', ids)`.
  - Status derivado: se mover para `new`/`contact`/`qualification`/`visit`/`proposal`/`negotiation` → manter `status='new'` (status só vira `converted`/`lost` em fluxos específicos).
  - O trigger existente `log_lead_stage_change` registra a mudança em `lead_interactions` automaticamente.
- Após sucesso: `logAudit('leads.bulk_stage_update', ...)`, atualizar `leads` local, limpar seleção, toast.
- Permissão: mesmo gate de admin já usado para a barra (`administrativo`/`superadmin`).

## 3. Checkboxes na versão mobile

A barra de ação em massa já está fora de `renderTable()`, então **já aparece no mobile** assim que houver seleção. Falta apenas o controle de marcar/desmarcar nos cards.

Em `src/pages/admin/LeadsList.tsx`, função `renderTableMobile()`:

- Acima da lista de cards, adicionar uma linha com `Checkbox` "Selecionar todos da página" + contador, visível apenas para admin.
- Dentro de cada `MobileTableCard`, adicionar um `Checkbox` no canto superior esquerdo com `onClick={(e)=>e.stopPropagation()}` para não disparar o `navigate` do card.
- Reusar `selectedIds`, `toggleSelect`, `togglePageSelection` já criados.

Nenhuma mudança de schema; nenhum migration. Apenas frontend + ajustes na edge function `form-submit`.

## Arquivos afetados

- `supabase/functions/form-submit/index.ts` — corrigir `source`/`channel` nos dois blocos (contact e property_lead).
- `src/pages/admin/LeadsList.tsx` — botão "Mudar etapa" + dialog, checkboxes na versão mobile, header de seleção mobile.
