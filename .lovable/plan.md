## Plano: Excluir múltiplos imóveis de uma vez

Adicionar seleção múltipla na listagem `/admin/imoveis` (`src/pages/admin/PropertiesList.tsx`) com ação em lote para excluir.

### Mudanças em `PropertiesList.tsx`

1. **Estado novo:** `selectedIds: Set<string>` para controlar imóveis marcados.

2. **Coluna de checkbox na tabela:**
   - Checkbox no `TableHead` que seleciona/desseleciona todos os imóveis filtrados visíveis (com estado indeterminate quando seleção é parcial).
   - Checkbox em cada linha (`TableRow`) usando `@/components/ui/checkbox`.
   - Visível apenas para quem tem permissão de excluir (`isAdmin` — administrativo/superadmin), seguindo a regra atual do botão lixeira.

3. **Barra de ações em lote** (aparece acima da tabela quando há seleção):
   - Texto: "X imóveis selecionados"
   - Botão "Limpar seleção"
   - Botão "Excluir selecionados" (variant destructive) → abre `AlertDialog` de confirmação ("Excluir N imóveis? Esta ação não pode ser desfeita.")

4. **Função `deleteSelected()`:**
   - `supabase.from('properties').delete().in('id', Array.from(selectedIds))`
   - Em sucesso: toast com contagem, remove do estado local e limpa `selectedIds`.
   - Em erro: toast destructive com a mensagem do Postgres.

5. **Substituir `confirm()` nativo** atual da exclusão individual pelo mesmo `AlertDialog` (consistência visual). Mantém o botão lixeira por linha.

6. **Limpar seleção** automaticamente quando filtros mudam, para evitar excluir item que o usuário não está mais vendo.

### Permissões e segurança
- UI: checkboxes/botão de lote só renderizados para `isAdmin` (mesma regra do delete individual hoje).
- Backend: a RLS `properties_admin_delete` já restringe `DELETE` a `is_admin(auth.uid())`. Nenhuma migração SQL necessária.

### Fora de escopo (para confirmar depois, se quiser)
- Outras ações em lote: pausar, publicar, mudar status, exportar CSV. Por ora só **excluir**, conforme pedido.
- Seleção múltipla nas listas de leads, tarefas, contratos etc.
- Lixeira / soft-delete (hoje exclusão é permanente — comportamento mantido).

### Restrições respeitadas
- Sem alterar RLS • sem mexer em outras telas • TS continua compilando • mobile mantém layout (checkbox cabe na coluna existente da imagem).