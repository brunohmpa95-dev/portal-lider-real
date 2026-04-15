

# Galeria Lightbox com Zoom — Página de Detalhe do Imóvel

## Resultado dos Testes

| Fluxo | Status | Observações |
|---|---|---|
| Home | OK | Todas as seções, JSON-LD LocalBusiness presente |
| Listagem /comprar | OK | 7 imóveis, filtros funcionais, ordenação |
| Detalhe do imóvel | OK | Galeria, ficha, form lead, WhatsApp, similares, JSON-LD RealEstateListing |
| Admin /admin/properties/new | Pendente login | Requer autenticação — não testado via browser |

## Implementação: Lightbox com Dialog + Carousel

### O que será feito

Ao clicar na imagem principal ou em qualquer thumbnail na página de detalhe, abre um Dialog fullscreen com:
- Carousel (Embla, já instalado) para navegar entre fotos
- Contador "3 / 12" no topo
- Botões prev/next estilizados
- Fechar com X ou clicando fora
- Suporte a swipe no mobile

### Arquivo modificado

**`src/pages/PropertyDetail.tsx`** — adicionar:
- Estado `lightboxOpen` + `lightboxIdx`
- Import de `Dialog`, `DialogContent` do shadcn/ui
- Import de `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`
- Bloco `<Dialog>` no final do JSX com carousel fullscreen
- `cursor-pointer` na imagem principal e thumbnails para indicar clicabilidade
- Callback `onClick` na imagem principal para abrir lightbox no índice atual
- Sincronização do `startIndex` do Embla com `lightboxIdx`

### Detalhes técnicos

- Dialog: `max-w-5xl`, fundo escuro (`bg-black/95`)
- Carousel: `opts={{ startIndex: lightboxIdx }}` para abrir na foto correta
- Contador: `{currentSlide} / {total}` posicionado no topo do dialog
- `setApi` do Carousel para rastrear slide atual via `api.on('select')`
- Botões prev/next: brancos, posicionados nas laterais
- Mobile: Embla já suporta swipe nativamente

