import Link from "next/link";
import { Suspense } from "react";
import { getPostsForViewer } from "@/lib/data";
import { HiveForm } from "@/components/HiveForm";
import { Reveal } from "@/components/Reveal";

/** Home — placeholder art direction until Jez's final design. */
export default function Home() {
  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-12 pb-20 md:px-12 md:pt-20 md:pb-32">
        <span className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-honey/15 blur-3xl" />
        <div className="stagger relative">
          <h1 className="max-w-5xl font-serif text-[15vw] leading-[0.88] font-light tracking-tight md:text-[9.5rem]">
            Every piece holds a <span className="italic text-honey">memory.</span>
          </h1>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/gallery" className="btn-glass bg-honey px-9 py-5 text-lg font-medium text-black transition-colors hover:bg-white">
              Enter the gallery →
            </Link>
            <p className="max-w-xs text-sm opacity-70">Walk the rooms, lean in, and find the story Bee-hind each painting.</p>
          </div>
        </div>
      </section>


      {/* journal */}
      <Suspense fallback={null}>
        <LatestPost />
      </Suspense>

      {/* hive — full width on tablet and desktop */}
      <section className="px-6 md:px-0">
        <Reveal className="relative overflow-hidden bg-honey px-8 py-16 text-black md:px-16 md:py-28 lg:px-24">
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-[1.1fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.3em] uppercase">Members first</p>
              <h2 className="mt-4 font-serif text-6xl leading-[0.9] font-light md:text-8xl lg:text-9xl">
                Join<br />the Hive
              </h2>
              <p className="mt-6 max-w-md text-lg">First look at new work, before it hits Instagram. Invitations to launches and private views.</p>
            </div>
            <div>
              <div className="text-lg [&_form]:max-w-none"><HiveForm source="home" onYellow /></div>
              <p className="mt-8 text-sm">
                Already in? <Link href="/signin" className="link-draw font-medium">Open the members app →</Link>
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

async function LatestPost() {
  const posts = await getPostsForViewer();
  const post = posts[0];
  if (!post) return null;
  return (
    <section className="px-6 pb-20 md:px-12">
      <Reveal>
        <Link href={`/journal/${post.slug}`} className="group grid gap-8 md:grid-cols-2 md:items-center">
          <div className="img-hover aspect-[4/3] bg-white/[0.04]">
            {post.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.cover} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] uppercase opacity-60">From the journal</p>
            <p className="mt-3 font-serif text-5xl leading-tight font-light transition-colors group-hover:text-honey">{post.title}</p>
            {post.excerpt && <p className="mt-3 text-lg opacity-75">{post.excerpt}</p>}
            <span className="link-draw mt-6 inline-block text-sm tracking-[0.18em] uppercase">Read the story →</span>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
