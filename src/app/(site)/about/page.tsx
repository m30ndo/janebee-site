import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { Reveal } from "@/components/Reveal";
import { getSiteImages } from "@/lib/site-images";

export const metadata: Metadata = { title: "About", description: "Jane Bee — paintings that hold a memory, and never quite behave." };

/** About Jane. Draft copy in Jane's voice — swap in her own words when she's happy with them. */

const FACTS = [
  { k: "Coffee", v: "Espresso. Double. Don't talk to me first." },
  { k: "Paints with", v: "Oils, acrylics, whatever's closest, occasionally her fingers" },
  { k: "Studio soundtrack", v: "Loud. Then louder." },
  { k: "Favourite colour", v: "Yellow. Obviously. Look around." },
  { k: "Can't paint without", v: "A memory she can't quite shake" },
  { k: "Will never paint", v: "Anything polite enough for a dentist's waiting room" },
];

const NOT_SORRY = [
  "For the lace that shows a little more than it should.",
  "For painting the morning after, not the night before.",
  "For leaving the drips in. They were there. So was I.",
  "For the titles. Especially the titles.",
  "For never being everyone's cup of tea.",
];

export default async function AboutPage() {
  const portrait = (await getSiteImages())["about-portrait"];
  return (
    <div>
      <PageBackground page="about" />

      {/* hello */}
      <section className="relative overflow-hidden px-6 pt-12 pb-20 md:px-12 md:pt-16 md:pb-28">
        <span className="pointer-events-none absolute -top-32 -left-24 h-[30rem] w-[30rem] rounded-full bg-honey/15 blur-3xl" />
        <div className="relative grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div className="stagger">
            <h1 className="font-serif text-[16vw] leading-[0.88] font-light tracking-tight md:text-[8.5rem]">
              Hello,<br />I&apos;m <span className="text-honey italic">Jane.</span>
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-white/85 md:text-2xl">
              I paint the bits of life people usually tidy away. The look across a bar. The bed you didn&apos;t make. The coffee that went cold
              because the conversation was better.
            </p>
          </div>
          <div className="relative">
            {portrait?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portrait.image} alt="Jane Bee" className="aspect-[4/5] w-full object-cover" style={{ objectPosition: portrait.focus }} />
            ) : (
              <div className="grid aspect-[4/5] place-items-center border border-white/10 bg-white/[0.04] text-sm text-white/40">Portrait of Jane — add it in Studio → About page</div>
            )}
            <p className="brush-bg absolute -bottom-6 -left-4 rotate-[-4deg] px-8 py-4 font-hand text-2xl text-black md:-left-10 md:text-3xl">
              Caught mid-mischief.
            </p>
          </div>
        </div>
      </section>

      {/* big line */}
      <section className="border-y border-white/10 px-6 py-16 md:px-12 md:py-24">
        <Reveal>
          <p className="mx-auto max-w-5xl text-center font-serif text-4xl leading-[1.1] font-light md:text-6xl">
            Every piece holds a memory. <span className="text-white/50">Some of them</span>{" "}
            <span className="text-honey italic">I probably shouldn&apos;t tell you about.</span>
          </p>
        </Reveal>
      </section>

      {/* the story */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-14 md:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] text-honey uppercase">The story so far</p>
            <h2 className="mt-4 font-serif text-5xl leading-[0.95] font-light md:text-7xl">
              Bee-hind<br />the <span className="italic">name.</span>
            </h2>
          </Reveal>
          <Reveal className="space-y-6 text-lg leading-relaxed text-white/85" delay={120}>
            <p>
              Everyone called me Bee long before I picked up a brush. Busy, a bit buzzy, and quite capable of a sting if you push your luck. The
              name stuck. So did the habit of collecting moments other people forget.
            </p>
            <p>
              I don&apos;t paint from a grand plan. I paint from a feeling that won&apos;t leave me alone: a smell of coffee, a scrap of lace, a
              song that was playing when something happened. The canvas is where I finally let it out. Sometimes it comes out pretty. Often it
              comes out cheeky. It always comes out honest.
            </p>
            <p>
              There are coffee cups in a lot of my work. That&apos;s not an accident. Coffee is where the good conversations happen — the
              confessions, the gossip, the &ldquo;you&apos;ll never guess what he said&rdquo;. If you look closely, most of my paintings are
              eavesdropping.
            </p>
            <p className="font-serif text-3xl leading-snug text-white italic">
              Never going to be everyone&apos;s cup of tea. More of an <span className="text-honey">espresso</span> girl.
            </p>
          </Reveal>
        </div>
      </section>

      {/* quick facts */}
      <section className="px-6 md:px-12">
        <Reveal className="bg-honey px-6 py-14 text-black md:px-14 md:py-20">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase">The short version</p>
          <h2 className="mt-3 font-serif text-5xl leading-[0.95] font-light md:text-7xl">Jane, in a hurry.</h2>
          <dl className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.k} className="border-t border-black/25 pt-4">
                <dt className="text-[11px] font-semibold tracking-[0.25em] uppercase">{f.k}</dt>
                <dd className="mt-2 font-serif text-2xl leading-snug font-light">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* not sorry */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <h2 className="font-serif text-5xl leading-[0.95] font-light md:text-7xl">
              Things I&apos;m <span className="text-honey italic">not</span> sorry for.
            </h2>
            <p className="mt-6 max-w-sm text-white/60">A short list. It gets longer every time someone says &ldquo;you can&apos;t paint that&rdquo;.</p>
          </Reveal>
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {NOT_SORRY.map((line, i) => (
              <Reveal as="li" key={line} delay={i * 80} className="group flex items-baseline gap-6 py-6">
                <span className="w-8 shrink-0 text-xs text-honey tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-2xl leading-snug font-light transition-all duration-500 group-hover:translate-x-2 group-hover:text-honey group-hover:italic md:text-3xl">
                  {line}
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* how it works */}
      <section className="px-6 pb-20 md:px-12 md:pb-28">
        <div className="grid gap-px bg-white/10 md:grid-cols-3">
          {[
            { t: "Come closer", d: "The best bits are small. A smudge of lipstick on a cup, a word hidden in the lace. Lean in — I painted them for the people who do." },
            { t: "One of one", d: "Every original exists once. When it's gone, it's gone. Prints are for the ones who missed out (and the ones who want it in every room)." },
            { t: "Join the Hive", d: "Members see new work first, get first dibs on originals and an invite when I throw open the studio doors. Usually with wine." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 100} className="bg-black p-8 md:p-10">
              <p className="font-hand text-3xl text-honey">{c.t}</p>
              <p className="mt-4 leading-relaxed text-white/75">{c.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* go on then */}
      <section className="px-6 pb-10 text-center md:px-12">
        <Reveal>
          <p className="font-serif text-4xl font-light md:text-6xl">Go on then. <span className="text-honey italic">Have a nosy.</span></p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/gallery" className="btn-sheen bg-honey px-9 py-4 font-medium text-black">Walk the gallery →</Link>
            <Link href="/the-hive" className="border border-white/40 px-9 py-4 font-medium transition hover:border-honey hover:text-honey">Join the Hive</Link>
            <Link href="/contact" className="border border-white/40 px-9 py-4 font-medium transition hover:border-honey hover:text-honey">Commission a piece</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
