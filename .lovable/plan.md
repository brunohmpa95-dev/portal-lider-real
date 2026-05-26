## Navegação rápida de fotos nos cards de imóveis

Adicionar setas laterais com glassmorphism sobre a imagem principal dos cards, permitindo navegar entre as fotos sem abrir o anúncio. Em mobile, também suporte swipe horizontal.

### Escopo

Componentes afetados (todos onde há imagem de card de imóvel):
- `src/components/property/PropertyCard.tsx` — card padrão usado em vitrines/listagens.
- `src/components/property/PremiumPropertyCard.tsx` — card de super destaque.

Não toca em `PropertyDetail`, galerias internas, nem no admin.

### Solução

Criar um componente reutilizável `src/components/property/CardImageCarousel.tsx` que encapsula:
- imagem com `loading="lazy"` (preservando comportamento atual);
- estado local `currentIndex` por instância (isolado por card);
- setas esquerda/direita com glassmorphism, só renderizadas quando `images.length > 1`;
- swipe horizontal em touch (touchstart/touchend, threshold ~40px);
- indicadores discretos (bolinhas) só se `images.length <= 6`; acima disso, contador `2 / 12`;
- navegação em loop (mais fluida que travar nas pontas);
- `stopPropagation` + `preventDefault` no clique das setas/swipe para não disparar o `<Link>` do card;
- `aria-label` "Foto anterior" / "Próxima foto", `type="button"`, foco visível.

Em `PropertyCard` e `PremiumPropertyCard`, substituir o `<img>` atual pelo novo componente, mantendo overlays existentes (badges, código, preço) por cima.

### Visual (glassmorphism)

- Botão circular 32px (desktop) / 36px (mobile, área de toque), `bg-white/15 backdrop-blur-md border border-white/25`, ícone `ChevronLeft/Right` em branco.
- Posição: `absolute top-1/2 -translate-y-1/2 left-2 / right-2`.
- Desktop: `opacity-0 group-hover:opacity-100 transition-opacity`; mobile (`md:` breakpoint): `opacity-70` sempre visível.
- Indicadores: pontinhos `1.5px` brancos com `bg-white/50` e ativo `bg-white`, centralizados embaixo, acima do gradiente de preço (com z-index correto para não conflitar).

### Detalhes técnicos

```text
CardImageCarousel
├── div.group.relative.overflow-hidden  ← wrapper (recebe className do parent p/ aspect ratio)
│   ├── img (src = images[currentIndex], lazy, transition opacity suave entre trocas)
│   ├── children (overlays existentes: gradient, badges, código, preço)
│   ├── button.prev  (hidden se length<=1, stopPropagation)
│   ├── button.next  (hidden se length<=1, stopPropagation)
│   └── indicators   (hidden se length<=1)
└── handlers: onTouchStart/Move/End para swipe
```

- Como o `<Link>` envolve o card em `PropertyCard`, as setas precisam ser `<button>` com `onClick={(e) => { e.preventDefault(); e.stopPropagation(); ... }}`. Isso impede o Link de navegar.
- Para swipe, usar listeners passivos; se `deltaX > 40` chama next/prev, e `e.stopPropagation()` para não interferir com scroll vertical da página (só intercepta quando o gesto é claramente horizontal).
- `useState` por instância garante isolamento; sem context global, performance ok com muitos cards.
- Pré-carregar próxima imagem opcional via `<link rel="prefetch">` — pulado para manter simples e leve.

### Acabamento

- Transição `opacity 200ms` ao trocar foto (sem reflow, mesma `<img>` mudando `src`).
- Bolinhas indicadoras pequenas (`h-1.5 w-1.5`), gap-1, posicionadas em `bottom-12` para ficar acima do preço sem poluir.
- Em `PremiumPropertyCard` (imagem maior), setas um pouco maiores (`h-9 w-9`) para escala correta.

### Verificação pós-implementação

- Clicar nas setas não navega para `/imovel/:id`.
- Clicar fora das setas (na imagem ou no conteúdo) navega normalmente.
- Cards com 1 foto não mostram setas/indicadores.
- Swipe em mobile funciona e não dispara o Link.
- Lazy loading preservado.
