# Carrossel de fotos mais fluido nos cards

## Problema

Hoje o `CardImageCarousel` troca o `src` de uma única `<img>` a cada clique/swipe. A próxima foto só começa a baixar nesse momento, então o usuário vê um "flash" / espera enquanto carrega. Em 4G/mobile o efeito é bem perceptível.

## Solução

Reescrever o `CardImageCarousel` (`src/components/property/CardImageCarousel.tsx`) para:

1. **Renderizar todas as fotos em um trilho** (`flex` com `translateX(-index * 100%)`), em vez de trocar `src`. Assim a foto seguinte já está no DOM e a transição é só um CSS transform — instantânea.
2. **Pré-carregar imagens vizinhas**: a foto atual usa `loading="eager"` + `fetchpriority="high"`; as 2 vizinhas (anterior/próxima) usam `loading="eager"`; as demais ficam `loading="lazy"` para não pesar a listagem.
3. **Swipe com arrasto em tempo real** (mobile): durante o `touchmove`, aplicar `translateX` proporcional ao dedo (efeito "seguindo o dedo"). No `touchend`, se passou de ~25% da largura ou velocidade suficiente, vai para a próxima; senão volta com transição suave. Mantém o threshold/`onClickCapture` atual para não disparar o link do card.
4. **Transição CSS** (`transition-transform duration-300 ease-out`) só quando NÃO está arrastando, para o arrasto ser 1:1 com o dedo.
5. **Manter** a API atual do componente (`images`, `alt`, `className`, `imgClassName`, `children`, `arrowSize`, `showIndicators`), as setas, os indicadores, o overlay (`children` continua sobreposto via `absolute inset-0`), badges e o `group-hover:scale-105` do `PropertyCard` (aplicado em cada `<img>` do trilho).

## Detalhes técnicos

```text
<div class="relative overflow-hidden">
  <div class="flex h-full w-full transition-transform"
       style="transform: translateX(calc(-index * 100% + dragX))">
    {images.map(src => (
      <img class="h-full w-full shrink-0 object-cover" src=... />
    ))}
  </div>
  {children}            // overlays/badges absolutos
  {setas + indicadores} // como hoje
</div>
```

- `children` precisa ficar fora do trilho (overlay absoluto sobre o container), o que já é o caso visualmente; só garantir z-index.
- Eager nas vizinhas: `eager` se `Math.abs(i - index) <= 1`, caso contrário `lazy`.
- `decoding="async"` em todas para não bloquear.
- `draggable={false}` nas `<img>` para evitar ghost-drag no desktop.
- Setas e swipe continuam com loop (módulo) como hoje.

## Arquivos afetados

- `src/components/property/CardImageCarousel.tsx` — reescrita interna, API pública intacta.

Nada muda em `PropertyCard.tsx`, `PremiumPropertyCard.tsx`, design system, dados, RLS ou backend.
