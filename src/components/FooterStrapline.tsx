"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The footer strapline in its square yellow box:
 * HONEST ● PLAYFUL ● SLIGHTLY NAUGHTY — then SLIGHTLY gets rubbed out, like
 * pencil under an eraser, and "VERY" is scribbled into the same spot by hand.
 * Same line, so the box stays slim. Plays when it comes into view; hover (or
 * tap) to play it again.
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
      className="footer-strap relative w-full bg-honey px-4 py-4 text-black sm:px-6 md:py-5 lg:inline-block lg:w-auto lg:px-10"
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
        {/* SLIGHTLY and VERY share one slot: the box never grows */}
        <span className="relative inline-grid place-items-center align-baseline">
          <span className="strap-slightly col-start-1 row-start-1">Slightly</span>
          <span className="strap-eraser pointer-events-none col-start-1 row-start-1" aria-hidden />
          <span className="strap-very col-start-1 row-start-1 font-hand text-[1.6em] leading-none tracking-normal normal-case">Very</span>
        </span>{" "}
        Naughty
      </p>
    </div>
  );
}

const Dot = () => <span className="mx-1.5 text-white min-[400px]:mx-2 sm:mx-4">●</span>;
