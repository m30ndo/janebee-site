import Link from "next/link";
import type { LegalPage } from "@/lib/legal";
import { Markdown } from "@/lib/markdown";

/** One legal page, with the others listed alongside so people can hop between them. */
export function LegalView({ page, all, base = "" }: { page: LegalPage; all: { slug: string; title: string }[]; base?: string }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[200px_1fr] md:gap-16">
      <nav aria-label="Legal pages" className="md:sticky md:top-28 md:self-start">
        <p className="mb-4 text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">The small print</p>
        <ul className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {all.map((p) => {
            const on = p.slug === page.slug;
            return (
              <li key={p.slug}>
                <Link
                  href={`${base}/legal/${p.slug}`}
                  className={`block border px-3 py-1.5 text-xs tracking-[0.18em] uppercase transition-colors md:border-0 md:border-l-2 md:px-4 md:py-2 ${on ? "border-honey bg-honey text-black md:bg-transparent md:text-honey" : "border-white/20 text-white/70 hover:text-white md:border-white/10"}`}
                >
                  {p.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <article className="animate-rise min-w-0 max-w-2xl">
        <h1 className="font-h1 text-5xl leading-[0.95] font-light md:text-7xl">{page.title}<span className="text-honey">.</span></h1>
        <div className="legal-body mt-10 text-white/85 [&_h2]:font-h2 [&_h2]:text-honey"><Markdown text={page.body} /></div>
      </article>
    </div>
  );
}
