

## Atualizar página Sobre e dados da empresa

### Resumo
Atualizar todo o conteúdo da página "Sobre", os dados da empresa em `constants.ts`, e adicionar a foto do fundador com layout lado a lado (foto à esquerda, texto à direita).

### Mudanças

**1. Copiar foto para o projeto**
- Copiar `user-uploads://Captura_de_Tela_2026-04-14_às_17.21.22.png` → `src/assets/founder.png`

**2. `src/data/constants.ts` — Atualizar dados reais**
- CRECI: `CRECI-MG 62.811`
- phone/whatsapp: `(37) 99194-8675`
- whatsappLink: `https://wa.me/5537991948675`
- email: `Liderimoveisitauna@gmail.com`
- address: `Rua Expedito Alves, 67 - Nova Villa Mozart, Itaúna - MG`

**3. `src/pages/About.tsx` — Reescrever conteúdo completo**

**Hero section com foto:**
- Layout `flex` com foto à esquerda (imagem circular ou arredondada com sombra) e texto "Quem somos" à direita
- Foto importada de `@/assets/founder.png`
- Na versão mobile, foto fica acima do texto

**Texto "Quem somos"** — substituir pelos 3 parágrafos fornecidos pelo usuário:
1. "A Líder Imóveis Itaúna nasceu de um propósito..."
2. "Tudo começou com uma paixão genuína..."
3. "Mesmo em fase inicial, nossa construção é sólida..."
4. "Nosso sonho é grande..."
5. "Mais do que vender imóveis, queremos construir relações..."

**Nossos Valores** — substituir os 4 valores atuais pelos 7 novos:
1. Clareza acima de tudo — `Eye` icon
2. O cliente é o centro — `Heart` icon
3. Proatividade que gera resultado — `Zap` icon
4. Transparência em cada etapa — `Shield` icon
5. Agilidade com atenção — `Clock` icon
6. Servir é um prazer — `HandHeart`/`Smile` icon
7. Evolução constante — `TrendingUp` icon

Cada valor com título e texto descritivo conforme fornecido. Grid `sm:grid-cols-2 lg:grid-cols-3` para acomodar 7 cards.

**CRECI** — manter seção com dados atualizados (puxados de `COMPANY`).

**CTA** — manter como está.

### Arquivos modificados
- `src/assets/founder.png` (novo)
- `src/data/constants.ts`
- `src/pages/About.tsx`

