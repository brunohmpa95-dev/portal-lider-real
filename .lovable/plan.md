
# Plano: 4 melhorias na gestão de imóveis (`/admin/properties`)

## 1. Arquivar / desarquivar (substituir exclusão como ação primária)

### Backend (migração)
- `properties`: adicionar colunas
  - `archived_at timestamptz NULL`
  - `archived_by uuid NULL`
  - `archived_reason text NULL`
- Atualizar policy `properties_public_read` para também exigir `archived_at IS NULL` (imóvel arquivado não vaza para o site público).
- Atualizar `properties_internal_read` — admins continuam vendo arquivados; demais papéis (corretor, vendas) só veem ativos por padrão (filtrado no frontend).
- Logar em `audit_log` ações `property.archive` / `property.unarchive` com `target_id` e metadados.

### Frontend
- Em `PropertiesList.tsx`: 
  - Trocar o ícone `Trash2` por `Archive` na ação por linha (admins). Manter `Trash2` apenas em um menu "mais ações" (kebab) → "Excluir permanentemente".
  - Barra de ações em massa ganha 3 botões: **Arquivar selecionados**, **Desarquivar selecionados** (visível só quando algum arquivado está selecionado) e **Excluir permanentemente** (com dialog reforçado).
  - Filtro de status ganha opções: `Apenas ativos` (padrão), `Apenas arquivados`, `Todos`.
  - Linhas arquivadas ficam com opacidade reduzida e badge "Arquivado".
- Modal "Arquivar": campo opcional `archived_reason` (textarea curto).
- Histórico: tab/dialog "Histórico" no detalhe do imóvel mostra entradas de `audit_log` filtradas por `target_type='property' AND target_id=<id>` (criação, edição, arquivamento, desarquivamento, exclusão). Apenas admins veem.

## 2. Importação em lote via CSV (`/admin/properties/import`)

### Página nova
Wizard de 4 passos numa página única:

1. **Upload** — `.csv` (até 5 MB, ~2000 linhas). Parse client-side com `papaparse` (já usar, ou adicionar dependência).
2. **Mapeamento de colunas** — tabela com colunas do CSV à esquerda e select à direita para mapear em campos da tabela `properties`. Campos obrigatórios marcados: `code`, `title`, `type`, `purpose`, `price`. Sugestão automática por nome de coluna (heurística simples). Templates: botão "Baixar CSV modelo".
3. **Validação** — pré-visualização das primeiras 50 linhas com:
   - tipo numérico (`price`, `area`, `bedrooms`, etc.)
   - enums (`type` em `PROPERTY_TYPE_OPTIONS`, `purpose` em `PROPERTY_PURPOSE_OPTIONS`)
   - `code` único (checa contra banco em uma só query `IN`)
   - `neighborhood` — se não existir em `neighborhoods`, avisar (não bloquear; será gravado como texto livre no campo da `properties` mesmo)
   - linhas com erro destacadas em vermelho com mensagem inline; usuário pode marcar "ignorar inválidas e prosseguir"
4. **Importação** — insert em chunks de 100. Barra de progresso. Status final: X criados, Y ignorados, Z com erro (download de CSV de erros).

### Permissão
Apenas roles `administrativo` e `superadmin` (botão "Importar CSV" no header da lista).

### Sem alterações de schema
A importação usa `INSERT` normal respeitando RLS `properties_internal_insert`. `created_by` = `auth.uid()`. Status default = `'draft'` (importados começam como rascunho para revisão).

## 3. "Excluir visíveis (filtrados)" na barra de ações

Adicionar **3º botão na bulk action bar** quando há filtros ativos:
- **"Arquivar todos os filtrados (N)"** — mostra count com base em `filtered.length`, não em `selectedIds`.
- Confirma em `AlertDialog` reforçado mostrando contagem e filtros aplicados ("Status: published, Tipo: apartamento, Busca: 'centro'").
- Internamente: `supabase.from('properties').update({ archived_at: now(), archived_by: uid, archived_reason }).in('id', filtered.map(p=>p.id))`.
- **Importante**: usa lista de IDs já carregada no front, então só age sobre o que está visível mesmo (não toca em itens fora da paginação se houvesse — atualmente lista carrega tudo). Adicionar nota visual "Esta ação afeta apenas os N imóveis listados acima".
- Mesma lógica disponível para "Desarquivar filtrados" quando o filtro de arquivados estiver ativo.

## 4. Filtro por intervalo de datas

Em `PropertiesList.tsx`, adicionar na linha de filtros:
- **Select "Campo de data"**: `Cadastro` (created_at) | `Atualização` (updated_at)
- **Date range picker** (shadcn Calendar com `mode="range"` em Popover) — labels "De" / "Até"
- Botão "Limpar datas" quando ativo
- Filtragem no `useMemo` existente, comparando contra o campo escolhido
- Aplicar também ao botão "Excluir/arquivar filtrados" do item 3
- Mobile: filtros de data viram um Sheet "Filtros avançados" para não quebrar layout

## Resumo de arquivos

| Arquivo | Mudança |
|---|---|
| Migração SQL | Adicionar colunas `archived_at/by/reason` em `properties`, atualizar policies de SELECT |
| `src/pages/admin/PropertiesList.tsx` | Status filter expandido, ações de arquivar/desarquivar, filtro de datas, botão "ações nos filtrados", histórico no detalhe |
| `src/pages/admin/PropertyImport.tsx` (novo) | Wizard de importação CSV |
| `src/App.tsx` | Rota `/admin/properties/import` |
| `src/lib/audit.ts` | Já existe — usar para registrar archive/unarchive/delete/import |
| `src/types/admin.ts` | Adicionar `archived_at`, `archived_by`, `archived_reason` em `AdminProperty` |
| `package.json` | Adicionar `papaparse` + `@types/papaparse` |

## Itens fora de escopo (sugestões para depois)
- Importação assíncrona via edge function (necessário se passar de ~2000 linhas)
- Upload de imagens via CSV (URLs)
- Restauração de versão anterior do imóvel a partir do audit log
- Exportar CSV dos selecionados (já mencionado em mensagem anterior; pode entrar junto se quiser)

## Pontos que pedem sua decisão
1. **"Excluir filtrados" deve arquivar (recomendado, reversível) ou excluir permanente?** Plano assume *arquivar*; se quiser exclusão dura, sinaliza.
2. **Importação CSV**: status inicial dos imóveis importados — `draft` (revisar antes de publicar) ou `published` direto? Plano assume `draft`.
3. **Histórico no detalhe** entra agora ou fica para depois? Posso entregar só a parte de logging em `audit_log` agora e a UI de histórico em outra rodada.
