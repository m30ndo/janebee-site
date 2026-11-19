import Link from "next/link";
import type { CarouselSettings, Slide } from "@/lib/carousel";

const HEIGHT = {
  small: "h-44 md:h-60",
  medium: "h-60 md:h-[22rem]",
  large: "h-72 md:h-[30rem]",
};
const RATIO = { portrait: 4 / 5, square: 1, landscape: 3 / 2 };

/**
 * A slow, endless line of works under the hero. Speed, size and the slides
 * themselves are set in Studio → Carousel. Pure CSS: no layout shift, no JS.
 */
export function WorksCarousel({ slides, settings }: { slides: Slide[]; settings: CarouselSettings }) {
  if (!slides.length) return null;
  // repeat short lists so one lap always runs wider than the screen
  const lap: Slide[] = [];
  while (lap.length < 10) lap.push(...slides);
  const duration = lap.length * settings.secondsPerSlide;

  return (
    <section aria-label="Selected works" className="works-carousel relative py-10 md:py-16" data-pause={settings.pauseOnHover ? "" : undefined}>
      <div className="mb-8 flex items-end justify-between gap-6 px-6 md:mb-10 md:px-12">
        <p className="text-[11px] tracking-[0.3em] text-white/60 uppercase">
          <span className="text-honey">●</span>&nbsp; Fresh off the easel
        </p>
        <Link href="/gallery" className="link-draw shrink-0 text-xs tracking-[0.2em] whitespace-nowrap uppercase hover:text-honey">All the works →</Link>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <ul className="works-track flex w-max" style={{ animationDuration: `${duration}s` }}>
          {[0, 1].map((copy) =>
            lap.map((s, i) => <SlideItem key={`${copy}-${i}-${s.id}`} slide={s} height={HEIGHT[settings.height]} hidden={copy === 1} />),
          )}
        </ul>
      </div>
    </section>
  );
}

function SlideItem({ slide: s, height, hidden }: { slide: Slide; height: string; hidden: boolean }) {
  const ratio = s.shape === "whole" ? (s.width && s.height ? s.width / s.height : 4 / 5) : RATIO[s.shape];
  const body = (
    <>
      <div className={`relative overflow-hidden bg-white/[0.04] ${height}`} style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.image}
          alt={hidden ? "" : s.caption ?? ""}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]"
          style={{ objectPosition: s.focus }}
        />
        {/* 85% black over every work; hover lifts it to show the colour */}
        <span className="pointer-events-none absolute inset-0 bg-black opacity-85 transition-opacity duration-700 group-hover:opacity-0 group-focus-visible:opacity-0" aria-hidden />
        {s.href && (
          <span className="absolute right-3 bottom-3 z-10 translate-y-2 bg-honey px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-black uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            See it in the gallery →
          </span>
        )}
      </div>
      {s.caption && (
        <p className="mt-3 font-serif text-lg font-light italic opacity-70 transition-colors group-hover:text-honey group-hover:opacity-100">{s.caption}</p>
      )}
    </>
  );
  return (
    <li className="shrink-0 pr-8 md:pr-14" aria-hidden={hidden || undefined}>
      {s.href ? (
        <Link href={s.href} tabIndex={hidden ? -1 : undefined} className="group block">{body}</Link>
      ) : (
        <div className="group">{body}</div>
      )}
    </li>
  );
}
