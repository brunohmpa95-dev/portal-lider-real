## Objetivo

Permitir que visitantes copiem o link de um imóvel específico para compartilhar onde quiserem (WhatsApp, redes, e-mail), com **pré-visualização rica** (título, foto, descrição) quando o link for colado.

---

## Sobre a pré-visualização rica

Recomendo **sim, gerar preview rico**. Sem isso, o link aparece como uma URL "pelada" e converte muito menos. Como o projeto é Vite (SPA) sem SSR, os crawlers de WhatsApp/Facebook/LinkedIn **não executam JavaScript** — então `react-helmet-async` sozinho não resolve para esses casos.

**Solução prática e leve:** uma Edge Function que detecta bots de redes sociais e devolve um HTML mínimo só com as meta tags Open Graph do imóvel; usuários humanos continuam recebendo o app normal. Sem alterar SSR nem rotas públicas.

---

## Escopo

### 1. Botão "Compartilhar" na página do imóvel
- Adicionar botão discreto em `src/pages/PropertyDetail.tsx` (próximo ao título/preço).
- Usa Web Share API nativa no mobile (abre seletor do sistema → WhatsApp, etc.).
- No desktop, abre um popover com:
  - Copiar link
  - Compartilhar no WhatsApp (link `wa.me/?text=...`)
  - Compartilhar no Facebook / X / Telegram (links de share)
  - E-mail (`mailto:`)
- Toast de confirmação ao copiar.

### 2. Componente reutilizável
- Criar `src/components/shared/ShareButton.tsx` recebendo `url`, `title`, `description`, `image`.
- Pode ser reaproveitado em cards (futuro) sem mexer agora.

### 3. Open Graph dinâmico por imóvel
- Adicionar `<Helmet>` em `PropertyDetail.tsx` com `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card` — cobre crawlers que executam JS (Googlebot, alguns previews).
- Para WhatsApp/Facebook/LinkedIn (que NÃO executam JS), criar Edge Function `og-property`:
  - Detecta User-Agent de bots sociais.
  - Busca o imóvel no banco e devolve HTML mínimo com as meta tags + redirect via `<meta refresh>` para humanos que caírem ali.
  - Configurar rewrite para que `/imovel/:id` passe primeiro pela função quando o UA for bot.

### 4. Registro de compartilhamento (opcional, leve)
- Não criar tabela nova nesta fase. Se quiser tracking depois, fica para uma fase 2.

---

## Arquivos a criar/alterar

**Criar:**
- `src/components/shared/ShareButton.tsx` — componente de share (popover + Web Share API + copiar link).
- `supabase/functions/og-property/index.ts` — devolve HTML com OG tags para crawlers.
- `supabase/config.toml` — registrar a função com `verify_jwt = false`.

**Editar:**
- `src/pages/PropertyDetail.tsx` — adicionar `<ShareButton>` e `<Helmet>` com OG tags do imóvel.

---

## Detalhes técnicos

- **Web Share API**: `if (navigator.share) navigator.share({title, text, url})` — fallback para popover quando não suportado.
- **URL de share**: usar `https://portal-lider-real.lovable.app/imovel/{id}` (domínio publicado, garante preview consistente).
- **OG image**: primeira foto do imóvel (`property.images[0]`); se não houver, omite (sem placeholder genérico).
- **Edge function detecta bots por UA**: `facebookexternalhit`, `WhatsApp`, `Twitterbot`, `LinkedInBot`, `TelegramBot`, `Slackbot`, `Discordbot`.

## Regras respeitadas

- Não altera layout além de um botão pequeno.
- Não mexe em busca, listagem, rotas ou CTAs de WhatsApp existentes.
- Mudança isolada, reversível, sem refatoração.
