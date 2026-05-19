## Problema

O CRM em `/admin/leads` já carrega leads ordenados por `created_at DESC` e o select "Ordenar" tem default `created_desc` ("Mais recentes"). Mesmo assim, os leads recém-criados estão aparecendo apenas na 3ª página.

Verifiquei o banco: existem 69 leads e os 3 mais recentes (cliques de WhatsApp de hoje) têm `created_at` correto. Ou seja, a query é correta — o que provavelmente está acontecendo é que a ordenação é refeita no front-end com `Array.sort` em cima de um array que pode ter sido mutado, ou o usuário está vendo cache de uma ordenação anterior (`sortBy` resetado entre sessões mas o estado de página não).

## Plano

### 1. Garantir ordenação "mais recentes primeiro" como padrão estável (`src/pages/admin/LeadsList.tsx`)

- Manter `sortBy` default = `created_desc`.
- Quando `loadAll()` terminar, **resetar `page` para 1** automaticamente — assim, após qualquer recarga (inclusive após criar/excluir leads ou mudar etapa em massa), o usuário sempre vê os mais recentes no topo da página 1.
- Resetar `page` para 1 também ao trocar `sortBy` (já existe, manter).

### 2. Tornar a ordenação visível e confiável

- Adicionar a coluna **"Criado em"** na tabela desktop (hoje só mostra "Atualizado"), exibindo `formatDateTime(lead.created_at)` — assim fica visualmente óbvio que os leads estão em ordem decrescente por data de criação.
- No card mobile, já mostra `created_at` no rodapé — manter.

### 3. Aplicar a mesma ordenação no Kanban

- `leadsForStage(stage)` usa `filtered`, que respeita `sortBy`. Confirmar que cada coluna do Kanban também lista do mais novo para o mais antigo (já acontece via `filtered`, mas adicionar comentário/teste rápido para garantir).

### 4. Outras telas que listam leads (verificação)

Já estão corretas (`order('created_at', { ascending: false })`):
- `src/hooks/useLeads.ts`
- `src/pages/admin/Dashboard.tsx` (recentes)
- `src/pages/broker/BrokerDashboard.tsx`

Nenhuma alteração necessária nessas.

## Arquivos afetados

- `src/pages/admin/LeadsList.tsx` (reset de página após `loadAll`, coluna "Criado em" na tabela desktop)

Sem mudanças de schema, sem migrações.
