
# Plano em 3 fases — Bairros reais, Site público, CRM interno

## Auditoria resumida

**Bairros hoje no sistema (em uso):**
- Constante `NEIGHBORHOODS` (12): Centro, Santa Edwiges, São Geraldo, Piedade, Santo Antônio, Residencial Morro Verde, Vila Romana, Alvorada, Graças, São José, Bela Vista, Vila São Fernando
- Banco (`properties` distinct): Centro, Santa Edwiges, São Geraldo, Piedade, Santo Antônio, Residencial Morro Verde, Vila Romana, Alvorada, Bela Vista (9)
- Mocks `src/data/properties.ts`: mesmos 9 acima

**Inconsistências detectadas:**
- `Graças`, `São José`, `Vila São Fernando` na constante mas **não aparecem em nenhum imóvel real** — alta probabilidade de serem inventados ou fora de Itaúna
- "Residencial Morro Verde" tem grafia inconsistente com padrão dos demais (parece ser um residencial/condomínio, não um bairro oficial)
- Sem tabela estruturada → impossível validar entrada, autocomplete ou desativar bairros
- Form de admin (`PropertyForm`) usa input livre de texto → permite cadastrar qualquer string
- Sem `slug`/`regiao` → SEO local e filtros normalizados impossíveis

**CRM/Pipeline atual:**
- Tabela `property_leads` com `funnel_stage`, `assigned_to`, `priority`, `tags`, `internal_notes`
- `lead_interactions` para histórico
- Falta: motivos de perda padronizados, campos de interesse (bairro/faixa/tipo), próximo follow-up, tarefas/lembretes, alertas de pendências, ciclo do imóvel ampliado

---

## Fase 1 — Bairros reais de Itaúna/MG (esta entrega)

### 1.1 Buscar lista oficial
Usar `code--fetch_website` em fontes públicas (prefeitura de Itaúna, Wikipedia, IBGE) para validar bairros. Marcar cada um como `verified: true|false`. Apenas os verified entram como `active` por padrão.

### 1.2 Migração SQL — nova tabela `neighborhoods`
```
id uuid pk
name text not null            -- "Santa Edwiges"
slug text unique not null     -- "santa-edwiges"
normalized text not null      -- "santa edwiges" (lowercase, sem acento)
region text                   -- "Central", "Norte", etc.
is_active boolean default true
verified boolean default false
created_at, updated_at
```
- RLS: leitura pública (`anon` + `authenticated`), escrita só admin
- Seed com bairros validados da pesquisa
- Índice em `slug` e `normalized`

### 1.3 Backfill e correção de dados existentes
- `UPDATE properties` normalizando grafias divergentes para o nome oficial
- `UPDATE listing_submissions` idem
- Migration NÃO destrutiva: nada é apagado, só padronizado

### 1.4 Frontend
- `src/data/constants.ts`: remover array `NEIGHBORHOODS` hardcoded
- Novo hook `useNeighborhoods()` que busca da tabela (cache via React Query)
- Substituir todos os 21 arquivos que importam `NEIGHBORHOODS` para usar o hook
- `PropertyForm` admin: trocar input texto livre por **Combobox/autocomplete** vinculado à tabela; só permite valores válidos
- `NeighborhoodsGrid`, filtros públicos, FAQ da home: passam a consumir do hook
- `listing_submissions` form (proprietário): mesmo combobox

### 1.5 Admin CRUD de bairros
- Nova rota `/admin/bairros` com listagem, criar/editar/desativar
- Permite admin adicionar bairros futuros sem código

### 1.6 Limpeza
- Remover bairros não-verificados da home/grid (passam a `is_active=false`)
- FAQ da home: trocar lista hardcoded por texto genérico ("principais bairros como Centro, Santa Edwiges, Piedade…") gerado do hook

---

## Fase 2 — Site público (próxima entrega após Fase 1 aprovada)

Resumo do que será feito (sem implementar agora):
- Página `/financiamento` com simulador, passo a passo, FAQ, documentos
- `sitemap.xml` dinâmico via edge function (imóveis publicados + páginas estáticas)
- `robots.txt` produção
- Reforçar links internos: cards de imóveis → bairro filtrado, footer com bairros reais
- WhatsApp contextualizado por página (já existe parcialmente, expandir)
- Schema.org `RealEstateAgent` com `areaServed` listando bairros reais
- Auditoria de heading hierarchy e contraste

**Sem páginas dedicadas por bairro** (conforme escolha).

---

## Fase 3 — CRM e Gestão Interna (após Fase 2)

Resumo:
- **Migration** ampliando `property_leads`: `interest_neighborhood_id`, `interest_min_price`, `interest_max_price`, `interest_property_type`, `next_followup_at`, `lost_reason`
- Tabela `lead_lost_reasons` (catálogo): preço, localização, sem retorno, escolheu concorrente, fora do perfil, outro
- Tabela `tasks` (genérica) vinculável a lead/cliente/imóvel/contrato com `due_at`, `assigned_to`, `status`
- Pipeline visual já existe (Kanban no `LeadsList`); adicionar na lateral motivo de perda obrigatório ao mover para "lost"
- Dashboard admin: KPIs reais de conversão por etapa, leads por bairro de interesse, tempo médio por etapa
- Status interno do imóvel ampliado: adicionar `captacao`, `aguardando_documentacao`, `reservado`, `em_proposta` ao enum `properties.status`
- Alertas de pendências: query agregada na home admin (docs pendentes, follow-ups vencidos, contratos vencendo em 30d)
- Padronização global de status em `src/types/status.ts` (já existe, expandir)

---

## Escopo desta entrega (Fase 1 apenas)

**Arquivos:**
- 1 migration SQL (criar `neighborhoods`, RLS, seed, backfill)
- `src/hooks/useNeighborhoods.ts` (novo)
- `src/data/constants.ts` (remover NEIGHBORHOODS)
- ~10 arquivos consumindo a constante migrados para o hook
- `src/pages/admin/PropertyForm.tsx` — combobox
- `src/pages/Advertise.tsx` (formulário de anúncio) — combobox
- `src/pages/admin/Neighborhoods.tsx` (novo CRUD)
- `src/App.tsx` — registrar rota `/admin/bairros`
- `src/lib/admin-nav.ts` — item "Bairros"
- `src/components/shared/NeighborhoodsGrid.tsx` — passa a usar hook

**Lista de bairros validados:** será definida via pesquisa web no início da implementação. Bairros sem fonte confiável entram com `verified=false`/`is_active=false` e ficam marcados como pendentes no admin para você revisar.

**Sem mudanças em:** auth, RLS de outras tabelas, área interna além de PropertyForm, sitemap, área do cliente/corretor, schema de outras tabelas.

Após Fase 1 implementada e validada, sigo para Fase 2 (site público) e depois Fase 3 (CRM).
