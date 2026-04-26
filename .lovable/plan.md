## Problema

Hoje a descrição do imóvel é salva no banco como texto livre (`properties.description`), mas renderizada em `src/pages/PropertyDetail.tsx` (linha 259) dentro de um `<p>` simples. O HTML colapsa quebras de linha e múltiplos espaços, então tudo vira um parágrafo único — mesmo que o admin tenha digitado em linhas separadas com `-` no início.

## Objetivo

A descrição deve aparecer no site público **exatamente no formato em que foi cadastrada**: se o corretor digitou uma linha por item começando com `-`, deve aparecer assim. Se digitou parágrafos separados por linha em branco, devem aparecer separados.

## O que vai mudar

### 1. Renderização da descrição em `PropertyDetail.tsx`

Substituir o `<p>` único por um bloco que:
- Preserva quebras de linha (cada linha do cadastro vira uma linha visual).
- Detecta automaticamente linhas que começam com `-`, `–`, `•` ou `*` e renderiza como uma lista visual com bullets/traços alinhados.
- Mantém parágrafos separados quando há linhas em branco entre blocos de texto.
- Sem nenhum HTML do usuário sendo executado (renderização segura — só texto).

Implementação: pequeno helper que faz `description.split('\n')` e monta um array de blocos (parágrafo ou lista) baseado no padrão das linhas. Renderiza `<ul>` para grupos consecutivos de linhas com marcador, `<p>` para o resto. Aplica `whitespace-pre-wrap` como fallback para preservar espaçamento dentro de cada linha.

### 2. Mesma renderização nos painéis internos (consistência)

Aplicar o mesmo helper onde a descrição do imóvel for exibida para usuários logados, se houver (ex.: detalhe de imóvel no admin/broker/cliente). Se o detalhe interno só usa `internal_notes`, fica de fora.

### 3. Cadastro permanece igual

O `<Textarea>` em `src/pages/admin/PropertyForm.tsx` já aceita quebras de linha — nenhuma mudança no formulário. Só preciso confirmar que o salvamento não está fazendo `trim` agressivo nas quebras (uma rápida olhada no `handleSubmit` mostrou que faz só `.trim()` nas pontas, o que é ok).

## O que NÃO entra

- Editor rich-text (negrito, itálico, links): não foi pedido e exigiria mudança bem maior.
- Reformatar descrições antigas já salvas: vão se beneficiar automaticamente se já tiverem quebras de linha; se foram salvas como texto corrido, continuam corridas (nada a fazer sem reescrever manualmente).
- Migração de banco: nenhuma — o campo `description` (text) já comporta tudo.

## Arquivos afetados

- `src/pages/PropertyDetail.tsx` — trocar o `<p>` único pelo novo render.
- (Possivelmente) 1 novo arquivo `src/lib/format-description.tsx` ou similar com o helper, para reaproveitar.

## Risco

Baixo. Mudança puramente visual em um componente, sem alteração de schema, RLS, rotas ou auth.