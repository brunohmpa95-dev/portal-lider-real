

## Leads em formato Kanban

Transformar a listagem de leads de tabela para um quadro Kanban, onde cada coluna representa uma etapa do funil (`LEAD_FUNNEL_STAGES`): Novo, Contato, Visita, Proposta, Negociação, Fechado, Perdido.

### Design

- Scroll horizontal com colunas lado a lado, cada uma com header colorido e contador de leads
- Cards compactos dentro de cada coluna mostrando: nome, prioridade (badge colorido), origem, telefone e data
- Drag-and-drop entre colunas para mover leads de etapa (atualiza `funnel_stage` no banco)
- Clique no card abre o detalhe (`/admin/leads/:id`)
- Botão de deletar visível para admins
- Toggle no topo para alternar entre visualização Kanban e Tabela (preserva a tabela existente)
- Filtros de busca e origem permanecem no topo, aplicáveis a ambas as views

### Cores das colunas

| Etapa | Cor do header |
|-------|--------------|
| Novo | blue-500 |
| Contato | cyan-500 |
| Visita | amber-500 |
| Proposta | purple-500 |
| Negociação | orange-500 |
| Fechado | green-500 |
| Perdido | red-400 |

### Drag-and-drop

Usar HTML5 drag-and-drop nativo (sem dependência extra):
- `draggable` nos cards
- `onDragStart` salva lead id + stage de origem
- `onDragOver` / `onDrop` na coluna destino
- No drop: atualiza `funnel_stage` via Supabase e atualiza state local com optimistic update

### Responsividade

- Desktop: colunas lado a lado com scroll horizontal
- Mobile: colunas empilhadas verticalmente com accordions colapsáveis por etapa

### Mudanças

**1 arquivo: `src/pages/admin/LeadsList.tsx`**

- Adicionar state `viewMode: 'kanban' | 'table'` (default: `kanban`)
- Adicionar toggle buttons (LayoutGrid / List icons) ao lado do título
- Manter toda a lógica de filtros e busca existente
- Adicionar função `updateLeadStage(id, newStage)` que faz `supabase.from('property_leads').update({ funnel_stage }).eq('id', id)`
- Renderizar condicionalmente: se `kanban`, mostrar o board; se `table`, mostrar a tabela atual
- Board: container `flex overflow-x-auto gap-4` com colunas `min-w-[280px] flex-shrink-0`
- Cada coluna: header com label + count + cor, scroll vertical interno (`max-h-[calc(100vh-280px)] overflow-y-auto`)
- Cada card: `Card` com nome, prioridade badge, origem, data, botões de ação

