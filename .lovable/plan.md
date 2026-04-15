

# Teste Mobile — Resultado e Plano de Correções

## Resultado dos Testes (375x812 — iPhone)

| Página | Status | Problemas encontrados |
|---|---|---|
| Home (hero + busca) | OK | Nenhum problema crítico |
| Home (destaques) | OK | Cards renderizam bem em coluna única |
| Home (footer) | OK | Layout adapta corretamente |
| Listagem /comprar | OK | Filtros empilhados, cards em coluna |
| Detalhe do imóvel | OK | Galeria, ficha, form lead — tudo funcional |
| Lightbox | **Problemas** | Dialog não ocupa tela cheia; header/footer do site ficam visíveis atrás; botões prev/next apertados |
| Menu hamburger | OK | Abre/fecha corretamente, links funcionais |
| Contato | OK | Formulário bem adaptado |
| WhatsApp button | **Menor** | Sobrepõe o canto inferior direito de alguns conteúdos |

## Problemas Identificados

### P1 — Lightbox não é fullscreen no mobile
O Dialog do lightbox usa `max-w-5xl w-[95vw] h-[90vh]` que deixa margens visíveis no mobile. O header do site e outros elementos ficam parcialmente visíveis por trás. Os botões prev/next ficam apertados nas laterais.

**Correção:** No mobile, usar `w-screen h-screen max-w-none` e `p-0`. Remover border-radius. Aumentar área de toque dos botões prev/next.

### P2 — Botão WhatsApp sobrepõe conteúdo
O botão flutuante no canto inferior direito pode sobrepor botões de ação importantes (ex: "Enviar mensagem" no form de lead, "Buscar" na home).

**Correção:** Adicionar `mb-20` ou padding-bottom nas seções finais para evitar sobreposição, ou reduzir o tamanho do botão no mobile.

### P3 — Lightbox: botões prev/next pequenos demais para toque
Os botões `h-10 w-10` são marginalmente pequenos para toque confortável em mobile (recomendado: 44x44px mínimo).

**Correção:** Aumentar para `h-12 w-12` no mobile.

## Arquivos a Modificar

| Arquivo | Ação |
|---|---|
| `src/pages/PropertyDetail.tsx` | Ajustar lightbox Dialog para fullscreen no mobile; aumentar botões prev/next |
| `src/components/layout/WhatsAppButton.tsx` | Reduzir padding no mobile para não sobrepor tanto |

## Detalhes Técnicos

### PropertyDetail.tsx — Lightbox mobile
- Importar `useIsMobile` de `@/hooks/use-mobile`
- No `DialogContent`, aplicar classes condicionais: mobile → `w-screen h-screen max-w-none rounded-none`; desktop → manter `max-w-5xl w-[95vw] h-[90vh]`
- Botões prev/next: `h-12 w-12 sm:h-10 sm:w-10`

### WhatsAppButton.tsx
- Reduzir de `p-4` para `p-3` no mobile: `p-3 sm:p-4`
- Ajustar posição: `bottom-4 right-4 sm:bottom-6 sm:right-6`

