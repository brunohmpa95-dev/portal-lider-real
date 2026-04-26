## Objetivo
1. Remover o botão "Acessar Sistema Principal" da Área do Cliente.
2. Revisar e otimizar todo o layout mobile da área autenticada do cliente (`/cliente/*`) para a melhor experiência possível.

---

## 1. Remoção do link "Sistema Principal"

**`src/components/client/ClientLayout.tsx`**
- Remover o bloco `<a href={COMPANY.systemUrl}>Acessar Sistema Principal</a>` da sidebar.
- Remover o import `LogIn` que ficará órfão.

**`src/pages/ClientArea.tsx`** (página antiga)
- Remover o card de destaque "Acessar sistema completo" que aparece no topo das ações.

> Mantemos `COMPANY.systemUrl` em `constants.ts` porque ainda é usado em `Documents.tsx` (página pública de boletos/documentos). Se quiser remover totalmente, me avise.

---

## 2. Revisão completa do layout mobile

### Diagnóstico atual
- **Sidebar fixa** (`md:w-64`) que no mobile vira um bloco grande **acima** do conteúdo — força o usuário a rolar muito antes de chegar ao conteúdo principal.
- **Card de usuário** ocupa espaço excessivo no topo no mobile.
- **Navegação vertical** com 6 itens empilhados consome ~300px da viewport mobile antes do conteúdo.
- **KPICards** em `grid-cols-2` no Dashboard ficam apertados em telas <360px.
- **Botões "Sair" e "Sair de todas"** com tipografia muito pequena (text-[10px]) — ruim para acessibilidade touch.
- **Páginas internas** (Support, Financial, Documents) usam diálogos e tabelas que podem estourar largura no mobile.

### Plano de ajustes

**A. `ClientLayout.tsx` — Reestruturação responsiva**
- **Mobile (< md):**
  - Sidebar vira **bottom navigation fixa** (estilo app) com os 6 itens principais usando apenas ícones + label curto, fixada em `bottom-0`.
  - Card do usuário compacto vira um **header sticky** no topo (avatar + nome + menu kebab para "Sair" / "Sair de todas").
  - Conteúdo principal recebe `pb-20` para não ficar atrás da bottom nav.
- **Desktop (≥ md):** mantém a sidebar lateral atual (já funciona bem).
- Padding do container reduzido no mobile (`px-3 py-4` em vez de `px-4 py-8`).

**B. `ClientDashboard.tsx`**
- KPIs: usar `grid-cols-1 xs:grid-cols-2 sm:grid-cols-3` com gap menor no mobile.
- Shortcuts: layout vertical de cards maiores e fáceis de tocar (mín. 56px de altura).
- Reduzir margens verticais no mobile.

**C. Páginas internas (`ClientSupport`, `ClientFinancial`, `ClientDocuments`, `ClientContracts`, `ClientProperties`, `ClientRental`, `ClientProfile`)**
- Garantir `overflow-x-auto` em tabelas.
- Diálogos com `max-w-[calc(100vw-2rem)]` e `max-h-[90vh] overflow-y-auto` no mobile.
- Botões de ação principal com `w-full sm:w-auto` no mobile.
- Form fields com `text-base` (16px) no mobile para evitar zoom no iOS.

**D. Acessibilidade touch**
- Todos os alvos de toque com mínimo 44x44px.
- Aumentar `text-[10px]/text-xs` em informações importantes.
- Ícones da bottom nav com `h-5 w-5` e label `text-[11px]`.

**E. Header (`Layout` global)**
- Verificar se o `Header` global colide com o header sticky do cliente — ajustar `top-` da sidebar/header conforme necessário.

---

## Arquivos afetados
- **Modificados:**
  - `src/components/client/ClientLayout.tsx` (reestrutura mobile + remoção do link)
  - `src/pages/ClientArea.tsx` (remoção do card)
  - `src/pages/client/ClientDashboard.tsx` (grid responsivo)
  - `src/pages/client/ClientSupport.tsx` (dialog/botões mobile)
  - `src/pages/client/ClientFinancial.tsx` (dialog/botões mobile)
  - `src/pages/client/ClientDocuments.tsx` (mobile)
  - `src/pages/client/ClientContracts.tsx` (mobile)
  - `src/pages/client/ClientProperties.tsx` (mobile)
  - `src/pages/client/ClientRental.tsx` (mobile)
  - `src/pages/client/ClientProfile.tsx` (mobile)

Sem alterações de banco de dados.

**Quer que eu siga com este plano?**