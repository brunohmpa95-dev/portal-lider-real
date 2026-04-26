## Diagnóstico

Analisando as duas screenshots no mobile (~414px) da página `PropertyDetail`:

1. **Atributos cortados (Imagem 1):** O grid `grid-cols-3 sm:grid-cols-5` com 5 cartões está espremendo o último card ("Área") contra a borda direita. Em telas estreitas, alguns `AttrCard` ficam < 80px e o conteúdo (`235.77m²`) estoura visualmente. Além disso, **o botão flutuante verde do WhatsApp** (`WhatsAppButton`, `fixed bottom-20 right-4`) sobrepõe o card "Área" porque a página não tem padding inferior reservado para esse botão flutuante.

2. **Formulário "Fale com um especialista" cortado (Imagem 2):** O card está claramente ultrapassando o viewport à direita — sintoma típico de **overflow horizontal** na rota. Possíveis causas: o `<Helmet>` JSON-LD não causa overflow, mas o `Carousel` montado no DOM (mesmo fechado) e os `motion.div` no `PropertyCard` da seção "Imóveis Semelhantes" podem estar empurrando largura. Mais comum: ausência de `overflow-x-hidden` no wrapper raiz e algum `min-width` implícito.

3. **CTA WhatsApp inline duplicado:** No mobile já existe um CTA verde inline ("Quero comprar — chamar no WhatsApp"), mas o **botão flutuante global** continua aparecendo por cima, criando ruído e cobrindo conteúdo.

## Correções propostas

### 1. `src/pages/PropertyDetail.tsx`
- **Grid de atributos:** trocar `grid-cols-3 sm:grid-cols-5` por `grid-cols-2 xs:grid-cols-3 sm:grid-cols-5` para que em telas < 420px caibam 2 cards por linha com folga, eliminando o corte.
- **AttrCard:** adicionar `text-center break-words` e permitir que o valor (`235.77m²`) quebre se necessário; aumentar levemente o padding vertical em mobile.
- **Padding inferior:** adicionar `pb-24 md:pb-12` no container principal para reservar espaço sob o último card e evitar sobreposição com o botão flutuante WhatsApp.
- **Largura segura:** envolver o conteúdo em `<div className="w-full max-w-full overflow-x-hidden">` (escopo da página) para anular qualquer overflow horizontal residual.

### 2. `src/components/layout/WhatsAppButton.tsx`
- Em rotas de detalhe de imóvel (`/imovel/:id`) no **mobile**, esconder o botão flutuante (já existe um CTA inline + sidebar). Usar `useLocation` + `useIsMobile` para retornar `null`. Em desktop continua visível.

### 3. `src/components/layout/Layout.tsx`
- Adicionar `overflow-x-hidden` no wrapper raiz (`<div className="flex flex-col min-h-screen overflow-x-hidden">`) como salvaguarda global contra overflow horizontal em qualquer página.

### 4. Galeria principal (mobile)
- Trocar a `aspect-[16/10]` da foto principal por `aspect-[4/3] sm:aspect-[16/10]` em mobile para que a imagem fique mais alta (proporção mais natural ao retrato do celular) e nada seja cortado nas laterais.
- Garantir `w-full` explícito no `<img>` e no wrapper para evitar largura intrínseca.

### 5. Sidebar (formulário) no mobile
- Remover o `sticky top-24` em mobile (manter só em `lg:`) para evitar comportamento estranho. Já é `lg:col-span-1`, mas garantir que o card use `w-full max-w-full` e que os inputs tenham `text-base` em mobile (evita zoom no iOS — já está em h-10, falta forçar `text-base sm:text-sm`).

### 6. QA visual
- Após as mudanças, o usuário poderá validar no preview mobile (375–414px). Se desejar, posso usar o navegador para verificar visualmente em 390×844 antes de finalizar.

## Arquivos afetados
- `src/pages/PropertyDetail.tsx` (grid, padding, overflow, aspect ratio, sticky)
- `src/components/layout/WhatsAppButton.tsx` (esconder em /imovel/:id mobile)
- `src/components/layout/Layout.tsx` (overflow-x-hidden global)

## Fora do escopo
- Reorganizar conteúdo da sidebar ou redesenhar o formulário.
- Mudanças no `PropertyCard` (já responsivo).