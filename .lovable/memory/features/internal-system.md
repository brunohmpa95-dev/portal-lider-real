---
name: Internal system portals
description: 3 internal portals (client/broker/admin) fully connected to Supabase with real queries, loading states, and centralized status constants
type: feature
---

## Status: All pages connected to Supabase (no more mocks in pages)

### Centralized Status Constants
- `src/types/status.ts` — LEAD_STATUS, VISIT_STATUS, PROPOSAL_STATUS, CONTRACT_STATUS, TICKET_STATUS, DOCUMENT_STATUS, COMMISSION_STATUS, TICKET_PRIORITY, DOCUMENT_VISIBILITY
- `src/lib/audit.ts` — logAudit helper for audit_log table

### Admin (/admin/*)
All connected to real Supabase tables:
- Dashboard — KPIs from leads, properties, visits, tickets, audit_log
- Clients — clients + profiles join, search, status filter
- Brokers — brokers + profiles join
- Contracts — contracts table, search, KPIs
- Documents — documents_unified table
- Tickets — support_requests table
- Financial — commissions + brokers + profiles nested join
- Audit — audit_log table, 100 most recent

### Broker (/parceiro/*)
All filtered by auth.uid():
- Dashboard — leads (assigned_to), visits (agent_id), commissions, proposals
- Leads — property_leads filtered by assigned_to
- Properties — properties (via RLS broker_partner policy)
- Visits — visits filtered by agent_id
- Proposals — proposals (via RLS broker policy)
- Commissions — commissions (via RLS broker policy)
- Profile — brokers + profiles, phone editable

### Client (/cliente/*)
All filtered by auth.uid():
- Dashboard — contracts count, ticket count, next billing due_date
- Contracts — contracts by user_id
- Properties — via contracts → property_id
- Profile — profile phone editable
- Documents, Financial, Support — already connected (pre-existing)

### Still TODO
- CRUD forms/modals (create/edit) for admin modules
- Document upload with Supabase Storage
- Audit logging in CRUD operations
