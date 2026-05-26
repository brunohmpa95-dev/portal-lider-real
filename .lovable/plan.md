## Persistência de estado e ordenação consistente nos leads

### 1. Persistir página + filtros/ordenação (LeadsList)

Hoje `loadAll()` chama `setPage(1)` no fim, e atualizações de lead (etapa, bulk) não preservam a página. Filtros/sort também se perdem ao recarregar a página (F5) porque são estado local.

Sincronizar todos os controles com a **URL** via `useSearchParams`:
- `page`, `sort`, `view` (kanban/table), `q`, `stage`, `source`, `channel`, `agent`, `period`.
- Inicializar `useState` a partir dos params; em cada mudança, atualizar a URL (`setSearchParams`, `replace: true`).
- Remover o `setPage(1)` dentro de `loadAll()` — só resetar página quando filtros mudam (já existe esse `useEffect`).
- Atualizações otimistas de lead (drag, bulk stage, bulk delete) já alteram apenas o array `leads`, sem chamar `loadAll`, então a página atual será mantida. Garantir que após `bulkDelete` a página atual ainda seja válida (clamp: se `page > totalPages`, ajustar para `totalPages`).

Resultado: ao dar F5, voltar de `LeadDetail`, ou atualizar uma etapa, o usuário continua na mesma página/filtro/ordem.

### 2. Seletor de ordenação

Já existe (`SORT_OPTIONS` com Criado/Atualizado asc/desc) e funcional. Apenas:
- Garantir que o valor venha/vá para a URL (`?sort=created_desc`).
- Manter como default `created_desc`.
- Pequeno ajuste visual: agrupar o seletor no topo com label "Ordenar por" para discoverability.

### 3. Ordenação padrão created_at DESC em todas as telas

- **LeadsList (Tabela)**: já ordena via `sortBy` (default `created_desc`). OK.
- **LeadsList (Kanban)**: hoje usa o mesmo array `filtered` (respeita `sortBy`). Forçar ordenação **sempre** por `created_at desc` dentro de cada coluna do Kanban, independente do `sortBy` selecionado (Kanban é visualização por etapa, ordem cronológica reversa faz mais sentido). Criar um array `kanbanLeads` separado que parte de `filtered` mas reordena por `created_at desc`.
- **Dashboard**: `recentLeads` já faz `.order('created_at', { ascending: false }).limit(5)`. OK — sem mudança.
- **AdminEsteira**: verificar e aplicar `.order('created_at', { ascending: false })` se faltar.
- **useLeads hook**: já ordena por `created_at desc`. OK.

### Arquivos afetados

- `src/pages/admin/LeadsList.tsx` — sincronização com URL, clamp de página pós bulk-delete, Kanban com ordenação fixa por `created_at desc`.
- `src/pages/admin/AdminEsteira.tsx` — confirmar/aplicar ordenação `created_at desc` na query de leads (se ainda não estiver).

Sem mudanças em schema/RLS/edge functions.
