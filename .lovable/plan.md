# Auditoria Mobile — Líder Imóveis

Auditoria feita lendo o código real (não genérica) e preservando os comportamentos já corrigidos: abas com estado, capa, marca d'água central, swipe nos cards, persistência de filtros no CRM.

---

## 1. O que já está bom no mobile

- **Cards**: `CardImageCarousel` tem swipe com lock de eixo (não conflita com scroll vertical), setas semi-visíveis, indicadores discretos, `swipedRef` cancela o clique pós-swipe, `loading="lazy"` + `fetchPriority` na imagem atual → troca fluida.
- **Formulário do imóvel (público)**: inputs com `h-11 text-base` em mobile → evita zoom no iOS.
- **CTA WhatsApp**: botão flutuante some na ficha do imóvel mobile (evita duplicar com CTA inline).
- **Header mobile**: hamburger com tap area razoável, menu acessível.
- **PropertyForm**: abas preservam estado; upload mantém capa.
- **Marca d'água**: central, discreta — sem retrabalho necessário.

---

## 2. Problemas encontrados (priorizados)

### CRÍTICOS (UX quebra ou inacessível no mobile)

1. **Galeria da ficha do imóvel sem swipe** (`PropertyDetail.tsx` linhas 184-217). Usa `<img>` + 2 botões; no celular o usuário tenta arrastar e nada acontece. Quebra a expectativa criada pelos cards.
2. **Ações do upload de fotos invisíveis no toque** (`PropertyImageUpload.tsx` linha 89: `opacity-0 group-hover:opacity-100`). No mobile não há hover → corretor não consegue definir capa, reordenar nem remover foto.
3. **Tap targets abaixo de 44px na grade de fotos do admin**: botões `h-7 w-7` (linhas 94-108) — impossível acertar com o dedo.
4. **Inputs numéricos da listagem com fonte <16px** (`PropertyListing.tsx` linhas 143-145) → iOS dá zoom ao focar e quebra layout.
5. **Setas da galeria detalhe pequenas** (`p-2` → ~36px) e sem `min-h-11 min-w-11`.

### IMPORTANTES (atrito perceptível)

6. **Filtros do listing**: 4 selects empilhados + "Mais filtros" + chips → consome muita tela antes dos imóveis. Falta pattern "Filtros" em Sheet/Drawer no mobile com contador.
7. **Paginação só com ícones** (`PropertyListing.tsx` 203-213): sem rótulo "Anterior/Próxima" e sem `aria-label`.
8. **Thumbnails da ficha** usam `onDoubleClick` para abrir lightbox — gesto não existe em touch; precisa toque longo ou botão "ampliar".
9. **Reordenar fotos no mobile**: só setinhas; sem drag. Para muitas fotos vira sofrimento.
10. **Mobile CTA WhatsApp inline** no detalhe aparece no meio do conteúdo, mas o usuário rola tudo até a sidebar — falta uma **barra fixa inferior** (sticky bottom bar) com Preço + WhatsApp + Ligar, padrão de portal imobiliário.
11. **LeadsList / PropertiesList**: provavelmente tabelas largas com scroll horizontal — falta variante `MobileTableCard` (já existe o componente, não está sendo usado em todas as listagens).
12. **Kanban (AdminEsteira)** no mobile: scroll horizontal em colunas largas é doloroso — falta seletor de coluna (tabs) no mobile.
13. **Floating WhatsApp button** em `bottom-20` no mobile pode colidir com sticky CTAs e não respeita `env(safe-area-inset-bottom)` em iPhones com notch inferior.

### REFINAMENTO

14. Skeleton dos cards do listing sem skeleton dos atributos (linha 188-189).
15. Badge "Novo/Destaque" + código no card muito pequenos (10px) — limite de legibilidade.
16. `useIsMobile` retorna `undefined` no primeiro render → mini-flash do CTA WhatsApp inline.
17. Header `h-16` mobile com logo `h-11` deixa pouco respiro vertical.
18. Sem `<main>` único explícito em `Layout` (usa `<motion.main>` ok — verificar acessibilidade).
19. Indicadores do carrossel posicionados em `bottom-12` podem desalinhar do preço em aspect ratios diferentes.

---

## 3. Correções a aplicar nesta passagem (seguras, sem mexer no que já foi consertado)

Vou aplicar diretamente, em ordem, somente as mudanças seguras de UX/responsividade/ergonomia. Nada de refator estrutural.

### A. Galeria da ficha do imóvel com swipe real
- Substituir o `<img>` + setas manuais em `PropertyDetail.tsx` (linhas 184-217) por `CardImageCarousel` (mesmo componente já validado), mantendo: badges, código, contador, abrir lightbox no clique e botão "ampliar" visível no mobile (substitui o `onDoubleClick`).
- Aumentar setas para `h-11 w-11` no mobile.

### B. Upload de fotos utilizável no mobile (PropertyImageUpload.tsx)
- Em telas `<sm`: barra de ações **sempre visível** abaixo da miniatura (capa / mover / remover), botões `h-9 w-9`.
- Manter overlay no hover em `sm:`.
- Manter a lógica de capa, ordem e marca d'água intocadas.

### C. Inputs numéricos do listing sem zoom no iOS
- `PropertyListing.tsx`: aplicar `className="text-base sm:text-sm"` nos 3 `Input` (valorMin/valorMax/código).
- Adicionar `inputMode="numeric"` nos campos de preço.

### D. Filtros no mobile via Sheet
- No mobile, esconder o painel de filtros e mostrar um botão "Filtros (n)" + chip de "Ordenar" que abrem `Sheet`. Desktop continua igual.
- Preserva 100% o estado/URL atual.

### E. Sticky bottom bar no detalhe do imóvel (mobile)
- Barra fixa: Preço resumido à esquerda + WhatsApp à direita, respeitando `pb-[env(safe-area-inset-bottom)]`.
- Esconder o CTA WhatsApp inline e o botão flutuante de WhatsApp quando a barra estiver ativa (já existe a regra de esconder o flutuante na ficha — só estender).
- Não alterar o formulário lateral.

### F. Paginação mais clara
- Adicionar labels "Anterior/Próxima" visíveis em `≥sm` e `aria-label` sempre. Botões `h-10 min-w-10`.

### G. WhatsApp flutuante com safe area
- Trocar `bottom-20 sm:bottom-6` por `bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6` e aumentar para `min-h-12 min-w-12`.

### H. Listagens admin (PropertiesList, LeadsList) — variante mobile
- Onde houver `<Table>` envolvido em `hidden md:block`, garantir bloco `md:hidden` com `MobileTableCard` exibindo: imagem/avatar, título, status, ações rápidas (ver/editar). Só onde já existe o padrão; sem rebuild de regras de negócio.
- Esta correção será feita só nas duas listagens mais usadas (`PropertiesList` e `LeadsList`); outras ficam como melhoria importante para próxima passagem.

### I. Kanban Esteira no mobile
- No `<md`: substituir o scroll horizontal de colunas por **Tabs** de status, mostrando uma coluna por vez. Mesmo array de cards, mesmo DnD desativado no mobile (toque longo em uma coluna só é mais confiável).

### J. Pequenos polimentos
- Ícone "expandir" visível no canto da galeria mobile (em vez de duplo-toque escondido).
- Skeleton de atributos no card de listing.
- `useIsMobile` inicializa com `false` em SSR-safe (evita flash do CTA).

---

## 4. O que fica apenas auditado (não aplicar agora)

- **Drag-and-drop real** para reordenar fotos (precisa biblioteca; risco médio).
- **Refator do componente Galeria** em peça compartilhada com lightbox embla unificado.
- **Refator profundo do LeadsList** (944 linhas) — exige varredura dedicada.
- **PropertyForm tabs**: revisar overflow só após validar visualmente no mobile.

---

## 5. Indispensáveis antes de declarar "mobile bom"

1. Galeria do detalhe com swipe (A).
2. Upload de fotos utilizável no celular (B + C de fotos).
3. Inputs sem zoom iOS (C).
4. Filtros em Sheet no mobile (D).
5. Sticky bottom bar de contato no detalhe (E).
6. Listagens admin com cards no mobile (H).

O resto é refinamento e ganho marginal.

---

## 6. Arquivos que serão alterados

- `src/pages/PropertyDetail.tsx`
- `src/components/admin/PropertyImageUpload.tsx`
- `src/pages/PropertyListing.tsx`
- `src/components/layout/WhatsAppButton.tsx`
- `src/pages/admin/PropertiesList.tsx`
- `src/pages/admin/LeadsList.tsx`
- `src/pages/admin/AdminEsteira.tsx`
- `src/hooks/use-mobile.tsx` (estado inicial)
- `src/components/property/PropertyCard.tsx` (skeleton + tamanho de badges — leve)

Nenhuma alteração em: `CardImageCarousel`, `watermark.ts`, `PropertyForm` (abas), lógica de capa, lógica de filtros/URL do CRM.

---

## 7. Validação manual necessária após implementar

- Verificar visualmente abrir/aplicar/limpar filtros no Sheet (iPhone Safari + Android Chrome).
- Confirmar que sticky bar do detalhe não tampa o formulário em telas muito pequenas (SE 320px).
- Testar reordenação de fotos no celular real (a melhoria deixa funcional, mas drag fica para depois).
- Conferir Kanban com tabs em uma jornada real de corretor.
