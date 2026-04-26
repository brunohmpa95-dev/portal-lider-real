## Objetivo

Três melhorias relacionadas à descrição dos imóveis:

1. **Pré-visualização ao vivo** no formulário do admin, idêntica ao que aparece no `PropertyDetail`.
2. **Parser mais seguro** — não quebrar frases que usam hífen como pontuação ("pé-de-moleque", "bem-vindo", "10-15 minutos", etc.).
3. **Opção de estilo do cabeçalho** — escolher por imóvel se o destaque vira `H3` (semântico, maior, com peso de subtítulo) ou apenas **destaque visual leve** (negrito sutil inline, sem virar título).

---

## 1. Pré-visualização no formulário (`src/pages/admin/PropertyForm.tsx`)

- Importar `FormattedDescription` de `@/lib/format-description`.
- Logo abaixo do `<Textarea>` da descrição, adicionar um bloco colapsável **"Pré-visualização"**:
  - Container com `border rounded-md p-4 bg-muted/30`.
  - Mostra o texto digitado renderizado pelo mesmo componente do site público.
  - Atualiza em tempo real (já é controlado por `form.description`).
  - Se vazio: mostrar placeholder "Digite a descrição para ver a pré-visualização".
- Não toca em mais nada do formulário.

## 2. Parser mais seguro (`src/lib/format-description.tsx`)

Regras adicionais de segurança antes de ativar o modo "cabeçalho + lista":

- **Mínimo de partes**: subir o limiar atual de 3 para **4 partes** detectadas pelo separador inline (reduz falsos positivos em frases curtas).
- **Tamanho mínimo dos itens**: cada parte resultante deve ter pelo menos **3 caracteres** após `trim()`. Se qualquer parte for menor, aborta o modo lista (provavelmente é hífen de pontuação tipo "A - B").
- **Densidade**: a soma de caracteres dos itens (excluindo o cabeçalho) deve representar pelo menos **40% do parágrafo total**. Evita ativar lista em parágrafos longos com um único traço perdido no meio.
- **Hífen colado** já está protegido pela regex `\s+[-–•]\s+` (exige espaço dos dois lados), mas vou reforçar com lookbehind/lookahead negativos para não casar quando vier antes de números pequenos colados (ex: "R$ 10-15 mil") — mantemos só ` - `, ` – `, ` • ` entre tokens alfanuméricos longos.
- **Curto-circuito por listas explícitas**: se o parágrafo já contém qualquer linha que casa com `bulletRe` (`- item` no início), ignora o modo inline e usa só o caminho de bullets explícitos.

Resultado: descrições com pontuação ficam intactas; só ativa modo lista quando o padrão "Cabeçalho - item - item - item - item" é claro e consistente.

## 3. Opção de estilo do cabeçalho (H3 vs destaque leve)

### Banco de dados
- Migração: adicionar coluna `description_heading_style` na tabela `properties`:
  - Tipo: `text` com `CHECK IN ('h3', 'soft')`.
  - Default: `'soft'` (comportamento mais conservador, próximo do que já existe).
  - Nullable: não.
- Sem mudanças em RLS (a coluna herda as policies existentes).

### Admin (`PropertyForm.tsx`)
- Adicionar dentro do card "Detalhes" um `<Select>` ou `<RadioGroup>` "Estilo do cabeçalho da descrição":
  - **Destaque leve** (default) — negrito sutil, mesmo tamanho do corpo.
  - **Título (H3)** — maior, com peso de subtítulo, semanticamente um `<h3>`.
- Persiste em `description_heading_style` no payload.
- A pré-visualização (item 1) usa o valor atual do select para refletir a escolha.

### Componente (`src/lib/format-description.tsx`)
- Aceitar nova prop `headingStyle?: 'h3' | 'soft'` (default `'soft'`).
- No bloco `headed-list`:
  - `'h3'` → renderiza `<h3 className="text-lg font-semibold text-foreground">`.
  - `'soft'` → mantém o atual (`<p className="text-base font-semibold text-foreground">`), ou ainda mais leve: `<p className="font-medium text-foreground">`.

### PropertyDetail (`src/pages/PropertyDetail.tsx`)
- Passar `headingStyle={property.description_heading_style}` para `<FormattedDescription>`.

### Tipos
- `src/integrations/supabase/types.ts` é regenerado automaticamente após a migração — não editar à mão.

---

## Arquivos afetados

- `src/lib/format-description.tsx` — parser mais seguro + prop `headingStyle`.
- `src/pages/admin/PropertyForm.tsx` — pré-visualização + select de estilo + persistência.
- `src/pages/PropertyDetail.tsx` — repassar `headingStyle` ao componente.
- **Nova migração** — coluna `description_heading_style` em `properties`.

## O que NÃO entra

- Editor rich-text (markdown, WYSIWYG) — fica para outra rodada se quiser.
- Migrar descrições antigas — o parser cuida em runtime.
- Configuração global de estilo padrão — escolha é por imóvel.

## Risco

Baixo. A migração só adiciona coluna com default seguro; nenhuma quebra em registros existentes. O parser fica mais conservador (mais frases ficam como parágrafo simples), nunca mais agressivo. A pré-visualização é puramente visual no admin.
