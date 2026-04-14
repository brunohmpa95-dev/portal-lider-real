

## Corrigir foto do fundador no hero — recorte e centralização

### Problemas identificados
1. A imagem `hero-founder.png` tem fundo (sala/ambiente) visível — não foi recortada ao redor da pessoa
2. O conteúdo (título + SearchBar) ficou deslocado para a direita por causa do `md:ml-[30%]`, perdendo a centralização

### Solução

**1. Recortar a imagem com remoção de fundo**
- Usar Python (rembg ou PIL) para remover o fundo da imagem `hero-founder.png`, gerando uma versão com transparência (apenas o homem, sem o ambiente atrás)
- Salvar como PNG com fundo transparente em `src/assets/hero-founder.png`

**2. Centralizar o conteúdo do hero (`src/pages/Index.tsx`)**
- Remover o `md:ml-[30%] lg:ml-[25%]` que desloca o conteúdo
- Manter o título e SearchBar centralizados no container (como era antes)
- A foto do fundador continua posicionada com `absolute bottom-0 left-[5%]`, sobrepondo o canto esquerdo sem afetar o fluxo do conteúdo central
- Reduzir ligeiramente a altura da foto para não competir tanto com o texto

### Arquivos modificados
- `src/assets/hero-founder.png` (reprocessado — fundo removido)
- `src/pages/Index.tsx` (remover margin-left do conteúdo)

