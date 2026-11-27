import Link from "next/link";
import { HiveForm } from "@/components/HiveForm";
import { Reveal } from "@/components/Reveal";
import { PageBackground } from "@/components/PageBackground";
import { Suspense } from "react";
import { getShopForViewer } from "@/lib/data";
import { ShopCarousel } from "@/components/shop/ShopCarousel";
import { getHomeHero } from "@/lib/settings";
import { heroVars } from "@/lib/home-hero";
import { FitLine } from "@/components/FitLine";

/** Home — placeholder art direction until Jez's final design. */
/** The shop's 3D carousel ("Fresh off the easel"), same content and settings as the shop (Studio → Carousel). */
async function HomeCarousel() {
  const { originals, products } = await getShopForViewer();
  return <ShopCarousel originals={originals} products={products} className="py-12 md:py-16" />;
}

export default async function Home() {
  const hero = await getHomeHero();
  return (
    <div>
      {/* hero — the background photo sits behind this section only. Height, headline position and photo focus
          per device come from Studio → Hero editor */}
      <section data-home-hero className="home-hero relative isolate overflow-hidden" style={heroVars(hero) as React.CSSProperties}>
        <PageBackground page="home" fit="section" />
        <span className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-honey/15 blur-3xl" />
        <div data-hero-area data-fit-box className="absolute inset-x-6 top-8 bottom-10 md:inset-x-12 md:top-12 md:bottom-14">
          <div data-hero-text className="hero-text stagger">
            {/* one line on desktop: shrinks only if the chosen font is too wide to fit */}
            <FitLine className="font-title text-[15vw] leading-[0.88] font-light tracking-tight md:text-[9.5rem]">
              Every piece holds a <span className="whitespace-nowrap italic text-honey">memory.</span>
            </FitLine>
          </div>
        </div>
      </section>

      {/* fresh off the easel: the shop's 3D carousel — set up in Studio → Carousel */}
      <Suspense fallback={<div className="h-[28rem]" />}>
        <HomeCarousel />
      </Suspense>

      {/* hive — full width on tablet and desktop */}
      <section className="px-6 md:px-0">
        <Reveal className="relative overflow-hidden bg-honey px-8 py-12 text-black md:px-16 md:py-12 lg:px-24 lg:py-14">
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-12">
            <div>
              <p className="text-xs font-medium tracking-[0.3em] uppercase">Members first</p>
              <h2 className="mt-3 py-2 font-hand text-6xl leading-[1.1] md:text-7xl lg:text-8xl">
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
