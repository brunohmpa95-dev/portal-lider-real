

## Adicionar foto do fundador no hero da página inicial

### O que será feito
Posicionar a foto do homem (recortada em formato circular ou com bordas arredondadas) no lado esquerdo do hero da página inicial, conforme indicado na região circulada da imagem de referência. O texto e a barra de busca ficam à direita/centro.

### Mudanças

**1. Copiar imagem para o projeto**
- `user-uploads://image.png` → `src/assets/hero-founder.png`

**2. `src/pages/Index.tsx` — Alterar layout do hero**

- Importar `heroFounder` de `@/assets/hero-founder.png`
- Reestruturar o conteúdo do hero para um layout `flex`:
  - **Esquerda**: foto do fundador com recorte arredondado, posicionada na parte inferior do hero (estilo "saindo" do fundo), com leve sombra
  - **Direita/Centro**: título, subtítulo e SearchBar (mantém como está)
- No mobile: foto fica oculta ou menor acima do texto
- A foto será posicionada com `absolute bottom-0 left-0` ou dentro do flex para criar o efeito visual de estar "plantado" no cenário, similar à referência

### Arquivos modificados
- `src/assets/hero-founder.png` (novo)
- `src/pages/Index.tsx`

