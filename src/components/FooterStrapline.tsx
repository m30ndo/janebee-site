"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The footer strapline in its square yellow box:
 * HONEST ● PLAYFUL ● SLIGHTLY NAUGHTY — then SLIGHTLY gets struck through
 * and "VERY" is scribbled in by hand just above it. Plays when it comes into
 * view; hover (or tap) to play it again.
 */
export function FooterStrapline() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0); // bumps to replay

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRun(1); io.disconnect(); }
    }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = () => setRun((r) => (r ? r + 1 : r));

  return (
    <div
      ref={ref}
      onMouseEnter={replay}
      onClick={replay}
      className="footer-strap relative w-full bg-honey px-4 pt-9 pb-4 text-black sm:px-6 md:pt-12 md:pb-6 lg:inline-block lg:w-auto lg:px-10"
      aria-label="Honest, playful, very naughty"
      role="img"
    >
      <p
        key={run}
        data-run={run ? "" : undefined}
        className="relative text-center text-[11px] font-semibold tracking-[0.18em] whitespace-nowrap uppercase min-[400px]:text-[13px] sm:text-base sm:tracking-[0.28em] md:text-lg lg:text-2xl"
        aria-hidden
      >
        Honest<Dot />Playful<Dot />
        <span className="relative inline-block">
          Slightly
          <span className="strap-strike absolute top-1/2 -right-[6%] -left-[6%] h-[2px] bg-black sm:h-[3px]" />
          <span className="strap-very absolute bottom-[105%] left-1/2 font-hand text-xl leading-none tracking-normal normal-case sm:text-3xl lg:text-4xl">
            VERY
          </span>
        </span>{" "}
        Naughty
      </p>
    </div>
  );
}

const Dot = () => <span className="mx-1.5 text-white min-[400px]:mx-2 sm:mx-4">●</span>;
