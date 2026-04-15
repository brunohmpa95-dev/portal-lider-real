

# Conclusão do Sistema Interno — Plano de Produção

## Auditoria: Estado Atual

### Já conectado ao Supabase (funcional):
- **Admin Dashboard** — KPIs reais (leads, properties, visits, tickets, audit)
- **Admin Leads** — CRUD completo com kanban drag-and-drop, filtros, busca, delete
- **Admin LeadForm / LeadDetail** — criação e edição de leads
- **Admin Properties** — CRUD completo com PropertyForm (create/edit/images)
- **Admin Agenda** — visitas reais do banco
- **Cliente Financeiro** — busca de boletos e solicitação de documentos
- **Cliente Suporte** — CRUD de tickets (criar, listar, status real)
- **Cliente Documentos** — download de modelos + solicitação de documentos
- **Auth completo** — login, registro, MFA, roles, redirecionamento por perfil

### Ainda usando dados mockados:
- **Broker Dashboard** — `mockBrokerLeads`, `mockBrokerVisits`, `mockCommissions`, `mockProposals`
- **Broker Leads** — `mockBrokerLeads`
- **Broker Properties** — mock local inline
- **Broker Visits** — `mockBrokerVisits`
- **Broker Proposals** — `mockProposals`
- **Broker Commissions** — `mockCommissions`
- **Broker Profile** — campos disabled sem dados do banco
- **Cliente Contratos** — `mockContracts`
- **Cliente Dashboard** — KPIs hardcoded (2 contratos, "20/04")
- **Cliente Properties** — empty state fixo
- **Admin Clients** — `mockClients`
- **Admin Brokers** — `mockBrokers`
- **Admin Contracts** — `mockContracts`
- **Admin Documents** — mock local inline
- **Admin Tickets** — `mockTickets`
- **Admin Financial** — `mockCommissions`
- **Admin Audit** — `mockAuditLogs`

### Tabelas Supabase existentes e prontas:
`profiles`, `user_roles`, `properties`, `property_leads`, `lead_interactions`, `visits`, `contracts`, `support_requests`, `boletos`, `document_requests`, `customer_documents`, `documents_unified`, `billing_records`, `notifications`, `audit_log`, `ombudsman_tickets`, `job_applications`, `listing_submissions`, `inspections`, `maintenance_requests`, `rental_inquiries`, `contact_messages`, `clients`, `brokers`, `proposals`, `commissions`

---

## Plano de Implementação (por prioridade)

### Bloco 1: Conectar módulos Admin ao Supabase (~8 arquivos)

1. **AdminClients** — query `clients` + `profiles`, busca, filtro status, modal de criação/edição com validação
2. **AdminBrokers** — query `brokers` + `profiles`, CRECI, região, status, modal criar/editar
3. **AdminContracts** — query `contracts` + profile join, filtro tipo/status, modal criar/editar, link com imóvel/cliente
4. **AdminDocuments** — query `documents_unified`, upload via `secureUpload`, filtro tipo/visibilidade, download via `secureDownload`
5. **AdminTickets** — query `support_requests`, atribuição, prioridade, status update, notas internas
6. **AdminFinancial** — query `commissions` + `billing_records`, KPIs reais, update status
7. **AdminAudit** — query `audit_log` real (já tem RLS), filtros por módulo/ação/período

### Bloco 2: Conectar Portal do Corretor ao Supabase (~7 arquivos)

1. **BrokerDashboard** — queries reais: leads atribuídos, visitas do corretor, comissões, propostas
2. **BrokerLeads** — query `property_leads` filtrado por `assigned_to = auth.uid()`, update de stage
3. **BrokerProperties** — query `properties` filtrado por `assigned_broker_id`
4. **BrokerVisits** — query `visits` filtrado por `agent_id = auth.uid()`, modal agendar, update status/notas
5. **BrokerProposals** — query `proposals` filtrado por `broker_id`, modal criar proposta
6. **BrokerCommissions** — query `commissions` filtrado por `broker_id`
7. **BrokerProfile** — query `brokers` + `profiles`, edição de dados permitidos

### Bloco 3: Conectar Área do Cliente ao Supabase (~4 arquivos)

1. **ClientDashboard** — KPIs reais: contratos, tickets, próximo vencimento (billing_records)
2. **ClientContracts** — query `contracts` filtrado por `user_id = auth.uid()`
3. **ClientProperties** — query `properties` via contratos vinculados ou proposals
4. **ClientProfile** — edição real de nome/telefone via `profiles` update

### Bloco 4: CRUDs e Modais de Criação/Edição

Para cada módulo, criar componentes de dialog/modal:
- **ClientForm** — criar/editar cliente (admin)
- **BrokerForm** — criar/editar corretor (admin)
- **ContractForm** — criar/editar contrato (admin)
- **ProposalForm** — criar proposta (broker/admin)
- **VisitForm** — agendar visita (broker/admin)
- **CommissionForm** — registrar comissão (admin/financeiro)
- **DocumentUploadForm** — upload com categorização (admin)
- **TicketDetailModal** — ver detalhes, atribuir, mudar status (admin)

Cada formulário com: validação, loading, toast de sucesso/erro, confirmação em delete.

### Bloco 5: Fluxos Operacionais

- **Lead → Visita → Proposta → Contrato**: botões de ação no LeadDetail para "Agendar Visita", "Criar Proposta"; no ProposalDetail para "Gerar Contrato"
- **Ticket lifecycle**: abertura → atribuição → andamento → resolução com timestamps
- **Documento lifecycle**: upload → pendente → aprovado/recusado
- **Comissão lifecycle**: geração vinculada a contrato → conferência → pagamento

### Bloco 6: Auditoria

- Criar helper `logAudit(action, module, entityType, entityId, metadata)` usando `supabase.from('audit_log').insert()`
- Adicionar chamadas nos CRUDs: criação, edição, delete, mudança de status, upload

### Bloco 7: UX de Produção

- Loading skeletons em todas as páginas de listagem
- Empty states com ícone + CTA em todas as tabelas vazias
- Confirmação via `AlertDialog` em ações destrutivas (delete, arquivar)
- Toast consistente (sonner) para sucesso/erro
- Filtros de período nos dashboards

### Bloco 8: Padronização de Status

Definir constantes centralizadas em `src/types/admin.ts`:
```
Lead: new → contact → visit → proposal → negotiation → closed → lost
Visit: scheduled → completed → cancelled → no_show
Proposal: pending → accepted → rejected → expired
Contract: draft → active → expired → cancelled → renewed
Ticket: open → in_progress → resolved → closed
Document: pending → active → rejected → archived
Commission: pending → approved → paid → cancelled
```

---

## O que NÃO será alterado
- Auth/RBAC existente (já funcional)
- Layouts (AdminLayout, BrokerLayout, ClientLayout)
- Componentes compartilhados (KPICard, StatusBadge, etc.)
- Schema de banco (todas as tabelas e RLS já existem)
- Páginas públicas do site

## Estimativa
- ~25 arquivos modificados
- ~8 novos componentes (formulários/modais)
- 0 migrações SQL (schema completo)
- Implementação em etapas incrementais

Dada a escala (~30+ arquivos), após aprovação implementarei em blocos: primeiro Admin (Bloco 1), depois Broker (Bloco 2), depois Cliente (Bloco 3), e finalmente CRUDs, fluxos e polimento (Blocos 4-8).

