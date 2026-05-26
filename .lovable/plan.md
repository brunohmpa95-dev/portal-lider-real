# Marca d'água centralizada estilo imobiliária

## Objetivo

Substituir a marca d'água atual (ícone pequeno no canto inferior direito) por uma versão **centralizada, grande, branca e translúcida** — no estilo da referência enviada (Vivenda Imóveis): símbolo + nome empilhados no centro da foto, opacidade suave, sem fundo sólido.

## O que muda

### 1. Nova arte da marca d'água — `src/assets/watermark-center.png`
- Composição vertical: ícone da casa (Líder) **em cima** + texto "Líder Imóveis" **embaixo**.
- Tudo em **branco puro** sobre fundo **transparente** (alpha real).
- Gerada via Python/Pillow no sandbox:
  - Reaproveita o recorte da casa já existente em `src/assets/watermark-house.png`, força todos os pixels visíveis para branco mantendo o alpha original.
  - Renderiza o texto "Líder Imóveis" em branco abaixo do ícone, fonte sem serifa, peso médio, com espaçamento generoso.
  - Canvas final ~1200x1400px (qualidade boa para fotos em alta resolução).
- Mantida transparência real — a opacidade final será aplicada no canvas de upload, não embutida na arte.

### 2. Reescrita de `src/lib/watermark.ts`
A função pública `applyWatermark(file: File): Promise<File>` continua igual (assinatura preservada) — só a lógica interna muda:

- **Remove** o posicionamento canto inferior direito (`x = canvas.width - targetW - padding` …).
- **Centraliza** a logo:
  ```
  x = (canvas.width  - targetW) / 2
  y = (canvas.height - targetH) / 2
  ```
- **Dimensiona** proporcional à largura útil:
  - Alvo: `targetW = canvas.width * WATERMARK_WIDTH_RATIO` (default `0.26` — dentro da faixa 22–30% solicitada).
  - Para fotos muito pequenas (< 600px de largura), reduz para `0.35` da menor dimensão, evitando que a logo encoste nas bordas.
  - Mantém o aspect ratio original da logo (`ratio = logo.naturalHeight / logo.naturalWidth`).
- **Opacidade** via `ctx.globalAlpha = WATERMARK_OPACITY` — default `0.16` (dentro da faixa 0.12–0.20 solicitada).
- **Constantes no topo do arquivo** para ajuste fácil:
  ```ts
  const WATERMARK_OPACITY = 0.16;
  const WATERMARK_WIDTH_RATIO = 0.26;
  ```
- Mantém JPEG quality 0.9 e o fallback que retorna o arquivo original em caso de erro.
- Logo carregada uma única vez (cache em memória) — comportamento atual preservado.

### 3. Sem outras mudanças
- `PropertyImageUpload.tsx` já chama `applyWatermark` — nenhuma alteração necessária.
- `CardImageCarousel`, `PropertyCard`, `PremiumPropertyCard`, listagem, detalhe, kanban, dashboard — **nada muda**, todos continuam exibindo as URLs do bucket como hoje.
- Header/Footer/Login/Register continuam usando `logo-transparent.png` (logo completo colorido com texto) — sem alteração.

## Imagens antigas

Não serão alteradas. Conforme solicitado, **nada destrutivo** será feito em fotos já cadastradas — elas permanecem com a marca d'água anterior (ou sem marca, se foram subidas antes do sistema existir). A nova marca centralizada vale só para uploads futuros.

Se no futuro você quiser reprocessar o histórico, isso seria uma rotina à parte (edge function/script administrativo) — fora do escopo desta tarefa, mas viável quando pedido.

## Arquivos afetados

- `src/assets/watermark-center.png` (novo — composição símbolo + nome em branco transparente)
- `src/lib/watermark.ts` (lógica de posicionamento reescrita; assinatura pública intacta)

Nada muda em backend, RLS, schema, storage, edge functions ou no fluxo de upload (ordenação, capa, carrossel, detalhe).

## Validação após implementar

1. Subir uma foto de imóvel pelo formulário de cadastro/edição.
2. Conferir no card / carrossel / página de detalhe que a marca aparece **centralizada, branca, translúcida**, ocupando ~26% da largura.
3. Testar com foto horizontal e foto vertical — centralização deve continuar correta nos dois casos.
4. Confirmar que o canto inferior direito ficou limpo.
