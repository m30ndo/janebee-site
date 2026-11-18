import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import Link from "next/link";
import { Strapline } from "@/components/Strapline";

export const metadata: Metadata = { title: "About", description: "Jane Bee — paintings that hold a memory." };

/** About Jane. Placeholder copy until Jane's own words are in. */
export default function AboutPage() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-28">
      <PageBackground page="about" />
      <Strapline className="mb-6 text-white/70" />
      <h1 className="font-serif text-6xl leading-[0.95] font-light md:text-8xl">
        Hello, I&apos;m <span className="text-honey italic">Jane.</span>
      </h1>
      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-white/85">
          <p>Placeholder: Jane&apos;s own words go here. Who she is, how she started painting, and why every piece holds a memory.</p>
          <p>Placeholder: the story Bee-hind the name, the coffee and lace, and the work that will never be everyone&apos;s cup of tea.</p>
          <p className="font-serif text-2xl italic text-white">More of an <span className="text-honey">espresso</span> girl.</p>
        </div>
        <div className="grid aspect-[4/5] place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-white/40">
          Portrait of Jane
        </div>
      </div>
      <div className="mt-16 flex flex-wrap gap-4">
        <Link href="/gallery" className="btn-sheen rounded-full bg-honey px-8 py-4 font-medium text-black">Walk the gallery →</Link>
        <Link href="/contact" className="rounded-full border border-white/40 px-8 py-4 font-medium transition hover:border-honey hover:text-honey">Get in touch</Link>
      </div>
    </section>
  );
}
