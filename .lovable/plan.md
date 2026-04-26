## Problema

A descrição vem do cadastro como **um parágrafo corrido**: `Apartamento à venda | Belvedere - 3 quartos - 1 suíte ampla com closet - Sala espaçosa - ...`. O `FormattedDescription` atual só reconhece traços no **início de linha**, então renderiza tudo como um bloco de texto sem estrutura visual.

## Solução

Atualizar `src/lib/format-description.tsx` para também tratar **traços inline** (` - `, ` – `, ` • `) como separadores de itens, e destacar o cabeçalho (parte antes do primeiro separador).

### Lógica de parsing nova

Para cada parágrafo (bloco entre linhas em branco) que **não** já esteja em formato de lista por linhas:

1. Dividir o texto pelo padrão ` [-–•] ` (espaço-traço-espaço, para não quebrar palavras compostas tipo "pé-direito").
2. Se resultar em **3+ partes**, tratar como cabeçalho + lista:
   - **1ª parte** → renderizada como linha de destaque (`font-semibold text-foreground text-base`) acima da lista.
   - **Demais partes** → itens de uma `<ul>` com traço, igual ao formato já existente.
3. Se resultar em menos de 3 partes, manter como parágrafo normal (evita quebrar frases curtas que usem traço como pontuação).
4. Limpar emojis decorativos repetidos no meio (📐 entre métricas) — opcional, mantenho como está se você preferir.

### Comportamento preservado

- Quem **já cadastra com Enter** entre os itens (formato linha-por-linha com `-` no começo) continua funcionando exatamente igual — o caminho antigo executa primeiro.
- Texto sem traços continua como parágrafo simples.
- Nenhum HTML é executado — só texto.

### Exemplo de saída

**Entrada (do banco):**
```
Apartamento à venda | Belvedere - 3 quartos - 1 suíte ampla com closet - Sala espaçosa - Cozinha com armários planejados - Banheiros com armários - Vista em 2 quartos - Prédio com elevador - 3 vagas de garagem 📐 Área total: 235,77m² 📐 Área útil: 129,00m² R$ 685.000,00

Imóvel bem distribuído, com excelente padrão e pronto para morar.
```

**Renderizado:**
- **Apartamento à venda | Belvedere** *(destaque, em negrito)*
  - 3 quartos
  - 1 suíte ampla com closet
  - Sala espaçosa
  - Cozinha com armários planejados
  - Banheiros com armários
  - Vista em 2 quartos
  - Prédio com elevador
  - 3 vagas de garagem 📐 Área total: 235,77m² 📐 Área útil: 129,00m² R$ 685.000,00
- *(parágrafo normal)* Imóvel bem distribuído, com excelente padrão e pronto para morar.

## Arquivos afetados

- `src/lib/format-description.tsx` — adicionar lógica de split inline + bloco de cabeçalho destacado.

Nada mais muda: o `PropertyDetail.tsx` já consome o componente e qualquer outra tela que use `FormattedDescription` ganha a melhoria automaticamente.

## O que NÃO entra

- Reescrever as descrições antigas no banco (não precisa — o parser cuida em runtime).
- Editor rich-text no admin.
- Botão de pré-visualização no formulário (pode entrar depois se quiser).

## Risco

Baixo. Mudança isolada num único arquivo de UI, sem schema, sem rotas, sem auth. O caso "frase com traço de pontuação" é mitigado pela regra de **mínimo 3 partes** para ativar o modo lista.
