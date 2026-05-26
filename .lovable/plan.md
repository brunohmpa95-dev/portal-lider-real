# Marca d'água com a logo (apenas a casa)

## Situação atual

Já existe um sistema de marca d'água em `src/lib/watermark.ts` que é aplicado em todo upload de foto de imóvel (via `PropertyImageUpload`). Hoje ele usa `src/assets/logo-transparent.png` — que também é usado no Header/Footer/Login/Register como logo completo (casa + texto "Líder Imóveis Itaúna"). Aplicar o logo completo como marca d'água fica pesado e ilegível em fotos.

O usuário quer usar **só a parte circulada** (o ícone da casa estilizado), sem o texto.

## Plano

1. **Salvar a logo original enviada** em `src/assets/lider-logo-source.png` (referência futura).

2. **Gerar a marca d'água** `src/assets/watermark-house.png`:
   - Recortar apenas o ícone da casa (área circulada) da imagem enviada.
   - Remover o fundo verde-escuro deixando **fundo transparente** (alpha real, PNG).
   - Manter o verde claro original da casa — fica natural sobre fotos.
   - Adicionar um leve "halo" branco bem suave atrás da casa para garantir contraste em fotos claras e escuras.
   - Tamanho final ~800x800px (qualidade suficiente para imóveis em alta resolução).
   - Faremos isso com Python/Pillow (já disponível no sandbox) detectando o fundo verde-escuro (cor uniforme) e convertendo em alpha.

3. **Apontar o watermark para a nova arte**:
   - Editar `src/lib/watermark.ts` linha 1 → `import logoUrl from '@/assets/watermark-house.png';`
   - Não mexer no resto da lógica (posição canto inferior direito, ~20% da largura, 60% de opacidade — já está bom). 
   - Os arquivos `Header.tsx`, `Footer.tsx`, `Login.tsx`, `Register.tsx` continuam usando `logo-transparent.png` (logo completo com texto) — sem alteração.

4. **Conferir o resultado**: após criar o PNG, abrir o arquivo para validar que (a) o fundo está realmente transparente, (b) só a casa aparece, (c) bordas limpas sem halo verde residual.

## Arquivos afetados

- `src/assets/lider-logo-source.png` (novo — referência)
- `src/assets/watermark-house.png` (novo — usado pela marca d'água)
- `src/lib/watermark.ts` (1 linha alterada)

Nada muda em backend, RLS, schema, ou nas fotos já enviadas (a marca d'água é aplicada no momento do upload — fotos antigas permanecem como estão).
