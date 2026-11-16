import type { ReactNode } from "react";

/**
 * Tiny, safe formatter for journal posts (no HTML allowed through).
 * Blank line = new paragraph · ## Heading · ### Smaller heading · > quote
 * **bold** · *italic* · [link text](https://…) · ![caption](image url) on its own line
 */
export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.startsWith("### ")) return <h3 key={i} className="mt-10 mb-3 font-serif text-2xl">{inline(b.slice(4))}</h3>;
        if (b.startsWith("## ")) return <h2 key={i} className="mt-12 mb-4 font-serif text-3xl font-light">{inline(b.slice(3))}</h2>;
        if (b.startsWith("> ")) return <blockquote key={i} className="my-8 border-l-2 border-pink pl-5 font-serif text-2xl italic leading-snug">{inline(b.replace(/^> ?/gm, ""))}</blockquote>;
        const img = b.match(/^!\[([^\]]*)\]\((\S+?)\)$/);
        if (img && /^(https?:\/\/|\/)/.test(img[2])) {
          return (
            <figure key={i} className="my-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img[2]} alt={img[1]} className="w-full" />
              {img[1] && <figcaption className="mt-2 text-sm opacity-60">{img[1]}</figcaption>}
            </figure>
          );
        }
        return <p key={i} className="mb-5 text-lg leading-relaxed">{inline(b)}</p>;
      })}
    </div>
  );
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((https?:\/\/|\/)[^)\s]+\)|\n)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t === "\n") out.push(<br key={k++} />);
    else if (t.startsWith("**")) out.push(<strong key={k++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("*")) out.push(<em key={k++}>{t.slice(1, -1)}</em>);
    else {
      const [, label, href] = t.match(/^\[([^\]]+)\]\((\S+)\)$/)!;
      const external = href.startsWith("http");
      out.push(
        <a key={k++} href={href} className="link-draw underline-offset-4" {...(external ? { target: "_blank", rel: "noopener" } : {})}>
          {label}
        </a>,
      );
    }
    last = m.index + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
