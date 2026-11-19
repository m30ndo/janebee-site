"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/painting";
import { formatUk } from "@/lib/dates";
import { Markdown } from "@/lib/markdown";
import { Reveal } from "@/components/Reveal";
import { imgBg, type Tone } from "./tone";

const isEarly = (p: Post) => !p.publicFrom || Date.parse(p.publicFrom) > Date.now();
const dateOf = (p: Post) => (isEarly(p) ? p.membersFrom : p.publicFrom);
const readMins = (p: Post) => Math.max(1, Math.round((p.body ?? "").split(/\s+/).filter(Boolean).length / 220));
const section = (p: Post) => p.category || "Studio notes";

/* ------------------------------------------------------------------ bits */

function Tag({ post, onDark = true }: { post: Post; onDark?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className={`px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em] uppercase ${onDark ? "bg-honey text-black" : "bg-black text-honey"}`}>{section(post)}</span>
      {isEarly(post) && <span className="bg-grey px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em] text-black uppercase">Hive first</span>}
    </span>
  );
}

function Meta({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <p className={`text-[11px] tracking-[0.2em] uppercase opacity-60 ${className}`}>
      {formatUk(dateOf(post), false)} · {readMins(post)} min read
    </p>
  );
}

/** Cover photo, or — when a post has none — a bold typographic cover in the brand colours. */
function Cover({ post, tone, className = "", big = false }: { post: Post; tone: Tone; className?: string; big?: boolean }) {
  if (post.cover) {
    return (
      <div className={`img-hover ${imgBg(tone)} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  const n = [...post.slug].reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  const look = ["bg-honey text-black", "bg-grey text-black", "bg-white text-black"][n];
  return (
    <div className={`relative flex flex-col justify-between overflow-hidden p-6 transition-transform duration-700 group-hover:scale-[0.985] ${look} ${className}`}>
      <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">{section(post)}</span>
      <span className={`font-serif leading-[0.9] font-light italic ${big ? "text-6xl md:text-8xl" : "text-5xl"}`}>
        {post.title.split(" ").slice(0, 3).join(" ")}
        {post.title.split(" ").length > 3 ? "…" : ""}
      </span>
      <span className="absolute -right-6 -bottom-10 font-serif text-[11rem] leading-none opacity-10" aria-hidden>●</span>
    </div>
  );
}

/* ------------------------------------------------------------------ list */

/**
 * The journal front page: a big lead story, a yellow ticker, a magazine-style
 * spread for the next three, then the rest. Filter by section along the top.
 */
export function JournalList({ posts, base = "", tone = "dark" }: { posts: Post[]; base?: string; tone?: Tone }) {
  const sections = useMemo(() => [...new Set(posts.map(section))], [posts]);
  const [pick, setPick] = useState<string | null>(null);
  const shown = pick ? posts.filter((p) => section(p) === pick) : posts;

  if (!posts.length) return <p className="opacity-70">Stories from the studio are coming soon.</p>;
  const [lead, ...rest] = shown;
  const spread = rest.slice(0, 3);
  const more = rest.slice(3);
  const href = (p: Post) => `${base}/journal/${p.slug}`;

  return (
    <div>
      {sections.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Sections">
          {[null, ...sections].map((s) => (
            <button
              key={s ?? "all"}
              role="tab"
              aria-selected={pick === s}
              onClick={() => setPick(s)}
              data-plain
              className={`border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition-colors ${pick === s ? "border-honey bg-honey text-black" : "border-white/25 hover:border-honey hover:text-honey"}`}
            >
              {s ?? "Everything"}
            </button>
          ))}
        </div>
      )}

      {lead && (
        <Link key={lead.id} href={href(lead)} className="group animate-rise grid gap-8 md:grid-cols-[1.35fr_1fr] md:items-end md:gap-12">
          <Cover post={lead} tone={tone} big className="aspect-[4/3] md:aspect-[5/4]" />
          <div className="md:pb-4">
            <Tag post={lead} />
            <h2 className="mt-5 font-serif text-5xl leading-[0.95] font-light transition-colors group-hover:text-honey md:text-6xl lg:text-7xl">{lead.title}</h2>
            {lead.excerpt && <p className="mt-5 max-w-md text-lg leading-relaxed opacity-80">{lead.excerpt}</p>}
            <Meta post={lead} className="mt-6" />
            <span className="mt-8 inline-flex items-center gap-3 border-b border-honey pb-1 text-sm tracking-[0.2em] uppercase">
              Read the story <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </span>
          </div>
        </Link>
      )}

      {/* ticker */}
      <div className="my-16 -mx-6 overflow-hidden bg-honey py-3 text-black md:-mx-12 md:my-20" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 text-sm font-semibold tracking-[0.3em] whitespace-nowrap uppercase">
          {[0, 1].map((c) => (
            <span key={c} className="flex gap-10">
              {[...posts.slice(0, 6).map((p) => p.title), "Honest", "Playful", "Slightly naughty"].map((t, i) => (
                <span key={i} className="flex gap-10">{t}<span className="text-white">●</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {spread.length > 0 && (
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          <Reveal>
            <Link href={href(spread[0])} className="group block">
              <Cover post={spread[0]} tone={tone} big className="aspect-[4/5]" />
              <div className="mt-6"><Tag post={spread[0]} /></div>
              <h3 className="mt-4 font-serif text-4xl leading-[1] font-light transition-colors group-hover:text-honey md:text-5xl">{spread[0].title}</h3>
              {spread[0].excerpt && <p className="mt-3 max-w-lg opacity-75">{spread[0].excerpt}</p>}
              <Meta post={spread[0]} className="mt-4" />
            </Link>
          </Reveal>
          <div className="flex flex-col gap-10 md:pt-24">
            {spread.slice(1).map((p, i) => (
              <Reveal key={p.id} delay={(i + 1) * 100}>
                <Link href={href(p)} className="group grid grid-cols-[0.9fr_1fr] gap-5">
                  <Cover post={p} tone={tone} className="aspect-square" />
                  <div className="self-center">
                    <Tag post={p} />
                    <h3 className="mt-3 font-serif text-2xl leading-tight transition-colors group-hover:text-honey md:text-3xl">{p.title}</h3>
                    <Meta post={p} className="mt-3" />
                  </div>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={300} className="border-l-2 border-honey pl-6">
              <p className="font-serif text-3xl leading-snug font-light italic">
                &ldquo;If it doesn&apos;t make somebody blush a little, it isn&apos;t finished.&rdquo;
              </p>
              <p className="mt-3 text-[11px] tracking-[0.25em] text-honey uppercase">Jane, probably mid-coffee</p>
            </Reveal>
          </div>
        </div>
      )}

      {more.length > 0 && (
        <>
          <div className="mt-24 mb-10 flex items-end justify-between border-b border-white/15 pb-4">
            <h2 className="font-serif text-4xl font-light md:text-5xl">More <span className="text-honey italic">to read</span></h2>
            <span className="text-[11px] tracking-[0.2em] uppercase opacity-60">{more.length} stories</span>
          </div>
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 3) * 80}>
                <Link href={href(p)} className="group block">
                  <div className="relative">
                    <Cover post={p} tone={tone} className="aspect-[4/3]" />
                    <span className="absolute top-3 left-3 bg-black px-2 py-1 font-serif text-lg leading-none text-honey">{String(i + 5).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-5"><Tag post={p} /></div>
                  <h3 className="mt-3 font-serif text-2xl leading-tight transition-colors group-hover:text-honey">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm leading-relaxed opacity-70">{p.excerpt}</p>}
                  <Meta post={p} className="mt-3" />
                </Link>
              </Reveal>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ one post */

export function PostView({ post, base = "", tone = "dark", more = [] }: { post: Post; base?: string; tone?: Tone; more?: Post[] }) {
  const others = more.filter((p) => p.id !== post.id).sort((a, b) => Number(section(b) === section(post)) - Number(section(a) === section(post))).slice(0, 3);
  return (
    <article>
      <div className="mx-auto max-w-5xl">
        <Link href={`${base}/journal`} className="link-draw text-xs tracking-[0.2em] uppercase opacity-70">← The journal</Link>
        <header className="animate-rise mt-10 mb-12 text-center">
          <Tag post={post} />
          <h1 className="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-[0.95] font-light md:text-7xl lg:text-8xl">{post.title}</h1>
          {post.excerpt && <p className="mx-auto mt-6 max-w-2xl font-serif text-2xl leading-snug font-light italic opacity-80 md:text-3xl">{post.excerpt}</p>}
          <Meta post={post} className="mt-8" />
        </header>
      </div>
      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className={`animate-fade mx-auto mb-14 max-h-[80vh] w-full max-w-6xl object-cover ${imgBg(tone)}`} />
      )}
      <div className="journal-body mx-auto max-w-2xl">{post.body && <Markdown text={post.body} />}</div>

      <div className="mx-auto mt-16 flex max-w-2xl items-center gap-4 border-t border-white/15 pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/hive-logo.svg" alt="" className="h-12 w-12" />
        <p className="text-sm opacity-75">
          Words by <span className="text-honey">Jane Bee</span>. Paint on her hands, coffee in the other one.
        </p>
      </div>

      {others.length > 0 && (
        <section className="mx-auto mt-24 max-w-6xl">
          <h2 className="mb-10 font-serif text-4xl font-light md:text-5xl">Keep <span className="text-honey italic">reading</span></h2>
          <ul className="grid gap-8 sm:grid-cols-3">
            {others.map((p) => (
              <li key={p.id}>
                <Link href={`${base}/journal/${p.slug}`} className="group block">
                  <Cover post={p} tone={tone} className="aspect-[4/3]" />
                  <div className="mt-4"><Tag post={p} /></div>
                  <h3 className="mt-3 font-serif text-2xl leading-tight transition-colors group-hover:text-honey">{p.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
