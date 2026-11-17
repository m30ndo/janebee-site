import { Strapline } from "@/components/Strapline";
import Link from "next/link";
import { Suspense } from "react";
import { getPostsForViewer, getRooms, paintingNumber } from "@/lib/data";
import { HiveForm } from "@/components/HiveForm";
import { Reveal } from "@/components/Reveal";

/** Home — placeholder art direction until Jez's final design. */
export default async function Home() {
  const rooms = await getRooms();
  const works = rooms.flatMap((r) => r.paintings).filter((p) => p.image).slice(0, 6);

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-12 pb-20 md:px-12 md:pt-20 md:pb-32">
        <span className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-honey/15 blur-3xl" />
        <div className="stagger relative">
          <Strapline className="mb-6 text-white/70" />
          <p className="inline-block animate-float font-punk text-5xl text-grey md:text-7xl">Come closer</p>
          <h1 className="mt-6 max-w-5xl font-serif text-[15vw] leading-[0.88] font-light tracking-tight md:text-[9.5rem]">
            Every piece holds a <span className="italic text-honey">memory.</span>
          </h1>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/gallery" className="btn-sheen rounded-full bg-honey px-9 py-5 text-lg font-medium text-black">
              Enter the gallery →
            </Link>
            <p className="max-w-xs text-sm opacity-70">Walk the rooms, lean in, and find the story Bee-hind each painting.</p>
          </div>
        </div>
      </section>


      {/* works */}
      {works.length > 0 && (
        <section className="px-6 py-20 md:px-12">
          <Reveal className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-5xl font-light">The work</h2>
            <Link href="/shop" className="link-draw text-sm tracking-[0.18em] uppercase">Shop originals →</Link>
          </Reveal>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
            {works.map((w, i) => (
              <Reveal as="li" key={w.id} delay={(i % 3) * 120} className={i % 3 === 1 ? "md:mt-16" : ""}>
                <Link href={`/work/${w.slug}`} className="group block">
                  <div className="img-hover relative aspect-[4/5] bg-white/[0.04]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.image!} alt={w.title} className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-end bg-gradient-to-t from-espresso/70 via-transparent p-5 font-serif text-xl text-cream italic opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {w.glimpse}
                    </span>
                  </div>
                  <p className="mt-3 text-xs opacity-60">{paintingNumber(w.number)}</p>
                  <p className="font-serif text-2xl leading-tight transition-colors group-hover:text-honey">{w.title}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* journal */}
      <Suspense fallback={null}>
        <LatestPost />
      </Suspense>

      {/* hive */}
      <section className="px-6 md:px-12">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] px-8 py-16 text-white md:px-16 md:py-20">
          <span className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-honey/25 blur-3xl" />
          <h2 className="relative font-serif text-5xl font-light md:text-7xl">
            Join <span className="text-honey">the Hive</span>
          </h2>
          <p className="relative mt-4 mb-10 max-w-md opacity-80">First look at new work, before it hits Instagram. Invitations to launches and private views.</p>
          <div className="relative"><HiveForm source="home" /></div>
          <p className="relative mt-8 text-sm opacity-70">
            Already in? <Link href="/signin" className="link-draw">Open the members app →</Link>
          </p>
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
