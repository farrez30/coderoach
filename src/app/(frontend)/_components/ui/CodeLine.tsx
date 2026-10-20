import { parseCodeLine } from '../../../../lib/codeLine';

/** One code panel line from the CMS; colour spans survive, any other markup shows as text. */
export function CodeLine({ line }: { line?: string | null }) {
  return (
    <span>
      {parseCodeLine(line).map((t, i) =>
        t.color ? (
          <span key={i} style={{ color: t.color }}>
            {t.text}
          </span>
        ) : (
          t.text
        ),
      )}
    </span>
  );
}
