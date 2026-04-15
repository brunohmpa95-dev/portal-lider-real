# Project Memory

## Core
Portal imobiliário Líder Imóveis Itaúna-MG. Extensão visual de sistema principal existente.
Verde (#5B9A2D) + branco + cinza escuro. Playfair Display headings, Inter body.
Todas as páginas internas conectadas ao Supabase real — sem mocks nas pages.
COMPANY/DEPARTMENTS constants em src/data/constants.ts — URLs do sistema principal configuráveis.
Lovable Cloud ativo. Auth com RBAC implementado. 8 perfis: cliente→superadmin + corretor_parceiro.
26+ tabelas com RLS. Status centralizados em src/types/status.ts. Audit helper em src/lib/audit.ts.

## Memories
- [Design tokens](mem://design/tokens) — Full color palette, fonts, CSS variables
- [Architecture](mem://features/architecture) — 3-layer structure: public site, system bridges, API-ready
- [Auth & RBAC](mem://features/auth-rbac) — Authentication, roles, route protection, audit logging
- [Database Schema](mem://features/database-schema) — 26+ tables, RLS policies, storage buckets, isolation rules
- [Internal System](mem://features/internal-system) — 3 portals fully connected to Supabase, status constants, audit helper
- [Roadmap](mem://features/roadmap) — 5-phase roadmap to transform MVP into professional real estate platform
- [Brand voice](mem://constraint/brand-voice) — Brand communication constraints
