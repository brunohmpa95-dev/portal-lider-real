

## Plano — Hero com imagem de fundo e overlay escuro

### O que muda
A seção Hero da Home atualmente usa um gradiente suave (`bg-gradient-to-b from-secondary to-background`). Será substituída por uma imagem de fundo de alta qualidade com overlay escuro semi-transparente, tornando o texto branco e o bloco de busca mais impactante.

### Implementação

**1. Imagem de fundo**
- Usar uma imagem de paisagem urbana/imobiliária de alta qualidade via URL externa (Unsplash) como `background-image` inline no `<section>` do Hero.
- Aplicar `bg-cover bg-center bg-no-repeat` para preenchimento responsivo.

**2. Overlay escuro**
- Adicionar um `<div>` absoluto com `bg-black/60` (60% opacidade) cobrindo toda a seção, criando contraste para o texto.

**3. Ajuste de cores do texto**
- Título: `text-white` (em vez de `text-foreground`)
- Subtítulo: `text-white/80` (em vez de `text-muted-foreground`)
- O SearchBar mantém seu fundo branco/card, destacando-se sobre o overlay.

**4. Altura e padding**
- Aumentar o padding vertical para `py-24 md:py-36` para dar mais presença visual à seção.

### Arquivo alterado
- `src/pages/Index.tsx` — apenas a seção Hero (linhas ~33-55)

### Resultado visual
- Seção hero com foto imobiliária de fundo, overlay escuro, texto branco grande, barra de busca com fundo claro flutuando sobre a imagem.

