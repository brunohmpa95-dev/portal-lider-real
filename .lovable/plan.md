

# Evolução do Sistema Interno — Líder Imóveis Itaúna

## Visão Geral

Reestruturar a área interna em 3 ambientes distintos (Cliente, Corretor Parceiro, Admin) com autenticação unificada, redirecionamento por perfil, dashboards específicos, módulos operacionais e visual premium. Tudo incremental, sem reconstruir o que já funciona.

---

## O que já existe e será reaproveitado

- **AuthContext** com RBAC, MFA, roles via `user_roles` — intacto
- **AdminLayout** com sidebar + header — expandir com novos módulos
- **ClientLayout** com sidebar — expandir menu
- **ProtectedRoute** — adicionar novo role
- **13 tabelas** com RLS completo — manter e expandir
- **7 roles** no enum `app_role` — adicionar `corretor_parceiro`
- Páginas admin existentes (Dashboard, Leads, Properties, Agenda, Team, etc.)
- Páginas cliente existentes (Dashboard, Documents, Support, Financial, Rental)

---

## Fase 1: Schema e Banco de Dados

### Novo role no enum:
- Adicionar `corretor_parceiro` ao `app_role` para distinguir corretores parceiros dos internos

### Novas tabelas (com RLS):

| Tabela | Campos principais | RLS |
|---|---|---|
| `clients` | profile_id, cpf_cnpj, rg_ie, birth_date, address, city, state, zip_code, notes | Cliente: próprio; Admin: todos |
| `brokers` | profile_id, creci, commission_pct, status, region | Corretor: próprio; Admin: todos |
| `proposals` | property_id, client_id, broker_id, amount, status, notes | Corretor: suas; Cliente: suas; Admin: todas |
| `commissions` | broker_id, property_id, proposal_id, contract_id, amount, status, due_date, paid_at | Corretor: suas; Financeiro+Admin: todas |
| `documents` (unificada) | profile_id, property_id, contract_id, type, title, file_url, visibility, status | Por visibility + owner |

### Alterações em tabelas existentes:
- `properties`: adicionar `rent_price`, `owner_client_id`, `assigned_broker_id`
- `visits`: adicionar `client_id`

---

## Fase 2: Auth e Redirecionamento

### Redirecionamento pós-login:
```text
corretor_parceiro → /parceiro
admin/superadmin/administrativo/corretor/vendas/locacao/financeiro → /admin
cliente (default) → /cliente
```

### Atualizações:
- `auth-types.ts`: adicionar `corretor_parceiro` ao enum, hierarchy e labels
- `Login.tsx`: lógica de redirecionamento por role
- `ProtectedRoute.tsx`: suporte ao novo role

---

## Fase 3: Layouts

### 3 layouts internos (mesmo padrão visual):

1. **ClientLayout** (expandir) — sidebar com: Dashboard, Contratos, Documentos, Financeiro, Atendimento, Imóveis, Perfil
2. **BrokerLayout** (novo) — sidebar com: Dashboard, Leads, Imóveis, Visitas, Propostas, Comissões, Perfil
3. **AdminLayout** (expandir) — sidebar com módulos adicionais: Clientes, Corretores, Contratos, Documentos, Tickets, Financeiro, Auditoria

Visual: fundo claro, sidebar organizada, header com busca + notificações + avatar, tipografia Inter, cards discretos.

---

## Fase 4: Páginas e Rotas

### `/cliente/*` (7 páginas — 4 existentes, 3 novas):

| Rota | Descrição | Status |
|---|---|---|
| `/cliente` | Dashboard: resumo, contratos, vencimentos, notificações | Expandir |
| `/cliente/contratos` | Lista de contratos, status, vigência, timeline | **Nova** |
| `/cliente/documentos` | Documentos com filtros e download | Existente |
| `/cliente/financeiro` | Boletos, vencimentos, 2ª via | Existente |
| `/cliente/atendimento` | Tickets de suporte | Existente |
| `/cliente/imoveis` | Imóveis vinculados, favoritos, negociações | **Nova** |
| `/cliente/perfil` | Dados cadastrais, preferências | **Nova** |

### `/parceiro/*` (7 páginas — todas novas):

| Rota | Descrição |
|---|---|
| `/parceiro` | Dashboard: leads, visitas, propostas, comissões, agenda do dia |
| `/parceiro/leads` | Leads da carteira, filtro por etapa, funil |
| `/parceiro/imoveis` | Imóveis atribuídos, status, compartilhar |
| `/parceiro/visitas` | Agenda, agendamentos, follow-up |
| `/parceiro/propostas` | Propostas enviadas, status, histórico |
| `/parceiro/comissoes` | Previstas, pendentes, pagas, por período |
| `/parceiro/perfil` | CRECI, região, dados profissionais |

### `/admin/*` (novos módulos — 6 páginas novas):

| Rota | Descrição | Status |
|---|---|---|
| `/admin` | Dashboard executivo expandido | Melhorar |
| `/admin/clientes` | Gestão de clientes, cadastro, histórico | **Nova** |
| `/admin/corretores` | Gestão de corretores, CRECI, desempenho | **Nova** |
| `/admin/contratos` | Contratos, vigência, pendências | **Nova** |
| `/admin/documentos` | Upload, categorização, visibilidade | **Nova** |
| `/admin/tickets` | Fila de chamados, prioridade, SLA | **Nova** |
| `/admin/financeiro` | Títulos, inadimplência, repasses | **Nova** |
| `/admin/auditoria` | Log de ações, alterações, controle | **Nova** |

---

## Fase 5: Componentes Compartilhados

- **KPICard** — card de indicador reutilizável (ícone, valor, label, cor)
- **StatusBadge** — badges padronizados (ativo, pendente, pago, vencido, etc.)
- **EmptyState** — estado vazio com ícone, título e CTA
- **DataTable** — tabela com busca, filtros e paginação simples
- **InternalPageHeader** — título + subtítulo + ações

---

## Fase 6: Dados Mockados

Criar `src/data/mock-internal.ts` com dados realistas de Itaúna:
- Clientes (nomes, CPF, endereços reais da cidade)
- Corretores (CRECI-MG, regiões, comissões)
- Contratos de locação e venda
- Propostas em diferentes estágios
- Comissões previstas e pagas
- Documentos por categoria

---

## Estimativa

| Item | Quantidade |
|---|---|
| Migrações SQL | ~4-5 |
| Páginas novas | ~16 |
| Páginas atualizadas | ~5 |
| Layouts novos | 1 (BrokerLayout) |
| Componentes compartilhados | ~5 |
| Arquivos de navegação | 1 (broker-nav.ts) |

---

## Ordem de execução

1. Migrações SQL (enum + tabelas + RLS)
2. Auth-types + redirecionamento no Login
3. BrokerLayout + broker-nav
4. Expandir ClientLayout e AdminLayout
5. Páginas do cliente (expandir dashboard, criar contratos/imóveis/perfil)
6. Páginas do corretor (todas as 7)
7. Páginas admin (6 novos módulos)
8. Dados mockados
9. Componentes compartilhados

**Dada a escala (~30+ arquivos), a implementação será entregue em etapas incrementais. Após aprovação, começo pelas Fases 1-3 (schema, auth, layouts) e sigo com as páginas por ambiente.**

