import Link from "next/link";
import type { Post } from "@/lib/painting";
import { formatUk } from "@/lib/dates";
import { Markdown } from "@/lib/markdown";
import { Reveal } from "@/components/Reveal";
import { imgBg, type Tone } from "./tone";

const isEarly = (p: Post) => !p.publicFrom || Date.parse(p.publicFrom) > Date.now();
const dateOf = (p: Post) => (isEarly(p) ? p.membersFrom : p.publicFrom);

export function JournalList({ posts, base = "", tone = "dark" }: { posts: Post[]; base?: string; tone?: Tone }) {
  if (!posts.length) return <p className="opacity-70">Stories from the studio are coming soon.</p>;
  const [lead, ...rest] = posts;
  return (
    <div>
      <Link href={`${base}/journal/${lead.slug}`} className="group mb-14 grid gap-6 md:grid-cols-2 md:items-end">
        <div className={`img-hover aspect-[4/3] ${imgBg(tone)}`}>
          {lead.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead.cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="animate-rise">
          <Meta post={lead} />
          <h2 className="mt-2 font-serif text-4xl leading-tight font-light transition-colors group-hover:text-honey md:text-5xl">{lead.title}</h2>
          {lead.excerpt && <p className="mt-3 text-lg opacity-80">{lead.excerpt}</p>}
          <span className="link-draw mt-5 inline-block text-sm tracking-[0.18em] uppercase">Read the story →</span>
        </div>
      </Link>
      <ul className="grid gap-x-6 gap-y-12 md:grid-cols-3">
        {rest.map((p, i) => (
          <Reveal as="li" key={p.id} delay={i * 80}>
            <Link href={`${base}/journal/${p.slug}`} className="group block">
              <div className={`img-hover aspect-[4/3] ${imgBg(tone)}`}>
                {p.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="mt-4"><Meta post={p} /></div>
              <h3 className="mt-1 font-serif text-2xl leading-tight transition-colors group-hover:text-honey">{p.title}</h3>
              {p.excerpt && <p className="mt-2 text-sm opacity-75">{p.excerpt}</p>}
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="text-xs tracking-[0.18em] uppercase opacity-60">
      {formatUk(dateOf(post), false)}
      {isEarly(post) && <span className="ml-2 rounded-full bg-grey px-2 py-0.5 tracking-normal text-cream normal-case opacity-100">Hive first</span>}
    </p>
  );
}

export function PostView({ post, base = "", tone = "dark" }: { post: Post; base?: string; tone?: Tone }) {
  return (
    <article className="mx-auto max-w-2xl">
      <Link href={`${base}/journal`} className="link-draw text-sm opacity-70">← Journal</Link>
      <header className="animate-rise mt-6 mb-10">
        <Meta post={post} />
        <h1 className="mt-3 font-serif text-5xl leading-[1.05] font-light md:text-6xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 font-serif text-2xl italic opacity-80">{post.excerpt}</p>}
      </header>
      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className={`animate-fade mb-10 w-full ${imgBg(tone)}`} />
      )}
      {post.body && <Markdown text={post.body} />}
    </article>
  );
}
