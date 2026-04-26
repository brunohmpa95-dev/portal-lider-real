import { Fragment } from 'react';

/**
 * Renderiza a descrição preservando o formato cadastrado:
 * - Linhas iniciadas por -, –, • ou * viram itens de lista com traço.
 * - Parágrafos corridos com padrão claro de "cabeçalho - item - item - item - item"
 *   viram cabeçalho + lista (com regras de segurança contra hífen de pontuação).
 * - Linhas em branco separam parágrafos.
 * - Demais linhas mantêm a quebra original (whitespace-pre-wrap).
 *
 * Prop `headingStyle`:
 *   - 'soft' (default): cabeçalho como destaque visual leve (negrito).
 *   - 'h3': cabeçalho como título semântico H3.
 */

export type HeadingStyle = 'soft' | 'h3';

type Block =
  | { kind: 'list'; items: string[] }
  | { kind: 'para'; lines: string[] }
  | { kind: 'headed-list'; heading: string; items: string[] }
  | { kind: 'gap' };

const bulletRe = /^\s*([-–•*])\s+(.*)$/;
// Separador inline: espaço + (- | – | •) + espaço. Evita quebrar palavras compostas.
const inlineSepRe = /\s+[-–•]\s+/;

const MIN_PARTS = 4;          // exige pelo menos 4 partes (1 cabeçalho + 3 itens)
const MIN_ITEM_LEN = 3;       // cada parte precisa ter no mínimo 3 chars
const MIN_DENSITY = 0.4;      // itens devem somar pelo menos 40% do parágrafo

function splitInlineList(line: string): { heading: string; items: string[] } | null {
  // Curto-circuito: se já tem bullet em qualquer linha, não tenta inline
  if (bulletRe.test(line)) return null;

  const parts = line.split(inlineSepRe).map((p) => p.trim()).filter(Boolean);
  if (parts.length < MIN_PARTS) return null;

  // Cada parte precisa ser razoavelmente longa (descarta "A - B - C")
  if (parts.some((p) => p.length < MIN_ITEM_LEN)) return null;

  const [heading, ...items] = parts;
  // Densidade: soma dos itens deve ser proporcionalmente significativa
  const itemsLen = items.reduce((acc, p) => acc + p.length, 0);
  const totalLen = line.length;
  if (totalLen > 0 && itemsLen / totalLen < MIN_DENSITY) return null;

  return { heading, items };
}

export function FormattedDescription({
  text,
  className = '',
  headingStyle = 'soft',
}: {
  text: string;
  className?: string;
  headingStyle?: HeadingStyle;
}) {
  if (!text) return null;

  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      if (blocks.length && blocks[blocks.length - 1].kind !== 'gap') blocks.push({ kind: 'gap' });
      continue;
    }
    const m = line.match(bulletRe);
    const last = blocks[blocks.length - 1];
    if (m) {
      if (last && last.kind === 'list') last.items.push(m[2]);
      else blocks.push({ kind: 'list', items: [m[2]] });
      continue;
    }
    const inline = splitInlineList(line);
    if (inline) {
      blocks.push({ kind: 'headed-list', heading: inline.heading, items: inline.items });
      continue;
    }
    if (last && last.kind === 'para') last.lines.push(line);
    else blocks.push({ kind: 'para', lines: [line] });
  }

  return (
    <div className={`text-sm text-muted-foreground leading-relaxed space-y-4 ${className}`}>
      {blocks.map((b, i) => {
        if (b.kind === 'gap') return null;
        if (b.kind === 'list') {
          return (
            <ul key={i} className="space-y-1.5">
              {b.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden className="text-primary shrink-0">–</span>
                  <span className="whitespace-pre-wrap">{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'headed-list') {
          return (
            <div key={i} className="space-y-2">
              {headingStyle === 'h3' ? (
                <h3 className="text-lg font-semibold text-foreground">{b.heading}</h3>
              ) : (
                <p className="font-medium text-foreground">{b.heading}</p>
              )}
              <ul className="space-y-1.5">
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span aria-hidden className="text-primary shrink-0">–</span>
                    <span className="whitespace-pre-wrap">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {l}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
