import Link from "next/link";
import { HiveForm } from "@/components/HiveForm";
import { Reveal } from "@/components/Reveal";
import { PageBackground } from "@/components/PageBackground";
import { WorksCarousel } from "@/components/home/WorksCarousel";
import { getCarousel } from "@/lib/carousel";

/** Home — placeholder art direction until Jez's final design. */
export default async function Home() {
  const carousel = await getCarousel();
  return (
    <div>
      {/* hero — the background photo sits behind this section only */}
      <section className="relative isolate overflow-hidden px-6 pt-12 pb-20 md:px-12 md:pt-20 md:pb-32">
        <PageBackground page="home" fit="section" />
        <span className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-honey/15 blur-3xl" />
        <div className="stagger relative">
          <h1 className="max-w-5xl font-title text-[15vw] leading-[0.88] font-light tracking-tight md:text-[9.5rem]">
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

      {/* works carousel — set up in Studio → Carousel */}
      <WorksCarousel slides={carousel.slides} settings={carousel.settings} />

      {/* hive — full width on tablet and desktop */}
      <section className="px-6 md:px-0">
        <Reveal className="relative overflow-hidden bg-honey px-8 py-12 text-black md:px-16 md:py-12 lg:px-24 lg:py-14">
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-12">
            <div>
              <p className="text-xs font-medium tracking-[0.3em] uppercase">Members first</p>
              <h2 className="mt-3 font-h1 text-6xl leading-[0.9] font-light md:text-7xl lg:text-8xl">
                Join<br />the Hive
              </h2>
              <p className="mt-4 max-w-md text-lg">First look at new work, before it hits Instagram. Invitations to launches and private views.</p>
            </div>
            <div>
              <div className="text-lg [&_form]:max-w-none"><HiveForm source="home" onYellow /></div>
              <p className="mt-5 text-sm">
                Already in? <Link href="/signin" className="link-draw font-medium">Open the members app →</Link>
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
