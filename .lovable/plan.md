## 1. Seleção múltipla e exclusão em massa de leads (CRM)

Em `src/pages/admin/LeadsList.tsx`:

- Adicionar estado `selectedIds: Set<string>` na lista.
- Coluna extra com `Checkbox` por linha (tanto no modo Tabela quanto nos cards mobile) + checkbox no header para "selecionar todos da página".
- Barra de ações fixa que aparece quando há ≥1 selecionado: mostra "X leads selecionados" + botão "Excluir selecionados" (vermelho) + "Limpar seleção".
- Botão de excluir abre um `AlertDialog` de confirmação ("Esta ação não pode ser desfeita. Excluir N leads?").
- Ao confirmar: `supabase.from('property_leads').delete().in('id', ids)`, com `logAudit('leads.bulk_delete', ...)`, toast de sucesso/erro, refresh da lista e limpeza da seleção.
- Restrição: ação só visível para `superadmin` / `administrativo` (usar `roles` já disponível via `useAuth`). Demais perfis não veem checkboxes nem barra.

Sem mudanças de schema — RLS já permite `DELETE` em `property_leads` para admins.

## 2. Toda mensagem do site vira lead "Novo" com prioridade máxima

Hoje o formulário "Fale Conosco" grava em `contact_messages` e **não** cria lead no CRM. Vamos passar a criar também um lead.

Em `supabase/functions/form-submit/index.ts`:

- No bloco `formType === "contact"`, após inserir em `contact_messages` com sucesso, inserir também em `property_leads`:
  ```
  {
    name, email, phone, whatsapp: phone || null,
    message: subject ? `[${subject}] ${message}` : message,
    source: 'website_contact',
    channel: 'website',
    funnel_stage: 'new',
    status: 'new',
    temperature: 'hot',
    priority: 'urgent',
  }
  ```
- No bloco `formType === "property_lead"` (formulários de interesse em imóvel), forçar `funnel_stage: 'new'`, `status: 'new'`, `temperature: 'hot'`, `priority: 'urgent'` — hoje vão sem prioridade definida.
- Auditar `lead.auto_created_from_contact` e disparar o `lead-distributor` (já existe) para entrar na fila de atribuição/SLA automaticamente.

Resultado: qualquer mensagem enviada pelo site (Contato, página de imóvel, WhatsApp já tratado por trigger) aparece imediatamente em `/admin/leads` como "Novo" com prioridade Urgente (máxima atenção), respeitando as regras de distribuição existentes.

## Detalhes técnicos

- Frontend (`LeadsList.tsx`): usa `Checkbox` do shadcn já presente; nenhuma nova dependência.
- Edge function: mantém o mesmo retorno ao usuário ("Mensagem enviada com sucesso!"); falha na criação do lead **não** quebra o envio da mensagem (log de auditoria com `result: 'partial'`).
- Sem migração de banco. RLS atual cobre tudo.

## Arquivos afetados

- `src/pages/admin/LeadsList.tsx` — seleção múltipla + exclusão em massa.
- `supabase/functions/form-submit/index.ts` — criação automática de lead "novo/urgente" a partir de Contato e ajuste de prioridade no property_lead.
