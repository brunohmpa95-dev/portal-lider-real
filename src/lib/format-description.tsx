import { Fragment } from 'react';

/**
 * Renderiza a descrição preservando o formato cadastrado:
 * - Linhas iniciadas por -, –, • ou * viram itens de lista com traço.
 * - Linhas em branco separam parágrafos.
 * - Demais linhas mantêm a quebra original (whitespace-pre-wrap).
 */
export function FormattedDescription({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  const lines = text.replace(/\r\n/g, '\n').split('\n');
  type Block = { kind: 'list'; items: string[] } | { kind: 'para'; lines: string[] } | { kind: 'gap' };
  const blocks: Block[] = [];

  const bulletRe = /^\s*([-–•*])\s+(.*)$/;

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
    } else {
      if (last && last.kind === 'para') last.lines.push(line);
      else blocks.push({ kind: 'para', lines: [line] });
    }
  }

  return (
    <div className={`text-sm text-muted-foreground leading-relaxed space-y-3 ${className}`}>
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
