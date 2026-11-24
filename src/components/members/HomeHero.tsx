"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JOKES, freshIndex, moodFor } from "@/lib/daily";

export type Slide = { image: string; title: string; href: string; room: string | null };

/**
 * The app's front door. The greeting follows the day ("Happy Friday"), the line
 * under it changes every visit, and Jane's paintings slowly drift behind it.
 */
export function HomeHero({ firstName, slides }: { firstName: string | null; slides: Slide[] }) {
  const [mood, setMood] = useState<{ hello: string; line: string; timeOfDay: string } | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const m = moodFor();
      setMood({ hello: m.hello, timeOfDay: m.timeOfDay, line: m.lines[freshIndex(`hive-line-${m.hello}`, m.lines.length)] });
      if (slides.length) setI(Math.floor(Math.random() * slides.length));
    }, 0);
    return () => clearTimeout(t);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[i];
  const helloLen = mood ? mood.hello.split(" ").length : 0;
  const words = mood ? `${mood.hello}${firstName ? `, ${firstName}` : ""}.`.split(" ") : [];

  return (
    <section className="relative left-1/2 -mt-2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden">
      <div className="relative h-[82svh] min-h-[30rem] md:h-[86svh]">
        {/* drifting paintings */}
        {slides.map((s, n) => (
          <div key={s.image} className="absolute inset-0 transition-opacity duration-[1600ms]" style={{ opacity: n === i ? 1 : 0 }} aria-hidden={n !== i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={n === i ? `on-${i}` : "off"} src={s.image} alt="" className={`h-full w-full object-cover ${n === i ? "kenburns" : ""}`} loading={n === 0 ? "eager" : "lazy"} />
          </div>
        ))}
        {!slides.length && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(238,63,140,0.35),transparent_60%)]" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-5 pb-12 md:px-8 md:pb-16">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-honey uppercase">{mood ? `${mood.timeOfDay} · in the Hive` : " "}</p>
          <h1 key={mood?.hello ?? "x"} className="word-in mt-4 font-title text-[14vw] leading-[0.9] font-light tracking-tight md:text-8xl">
            {mood ? words.map((w, n) => (
              <span key={n} style={{ animationDelay: `${0.1 + n * 0.12}s` }} className={n >= (firstName ? helloLen : helloLen - 1) ? "italic text-honey" : ""}>
                {w}{n < words.length - 1 ? " " : ""}
              </span>
            )) : <span className="opacity-0">Hello.</span>}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-snug text-white/85 md:text-xl" style={{ minHeight: "1.5em" }}>
            {mood?.line}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/members/gallery" className="btn-glass inline-block bg-honey px-7 py-3.5 font-medium text-black">Walk the gallery →</Link>
            <Link href="/members/shop" className="inline-block rounded-full border border-white/30 px-6 py-3.5 text-sm tracking-[0.15em] uppercase backdrop-blur transition-colors hover:border-honey hover:text-honey">Shop first</Link>
          </div>
          {slide && (
            <Link href={slide.href} className="group mt-10 flex items-center gap-3 self-start text-xs text-white/70 transition-colors hover:text-white md:absolute md:right-8 md:bottom-16 md:mt-0 md:self-auto">
              <span className="flex gap-1" aria-hidden>
                {slides.slice(0, 8).map((_, n) => <span key={n} className={`h-[3px] rounded-full transition-all duration-700 ${n === i % 8 ? "w-6 bg-honey" : "w-2 bg-white/40"}`} />)}
              </span>
              <span className="truncate">Now showing: <span className="text-white group-hover:text-honey">{slide.title}</span>{slide.room ? ` · ${slide.room}` : ""}</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/** A different art joke every visit. Tap for another. */
export function JokeCard() {
  const [n, setN] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setN(freshIndex("hive-joke", JOKES.length)), 0);
    return () => clearTimeout(t);
  }, []);
  if (n === null) return <div className="h-48" aria-hidden />;
  const j = JOKES[n];
  const another = () => { setShown(false); setN(freshIndex("hive-joke", JOKES.length)); };
  return (
    <div key={n} className="joke-pop relative mx-auto max-w-md -rotate-1 bg-pink p-7 text-black shadow-[8px_8px_0_#000,8px_8px_0_1px_rgba(255,255,255,0.4)] md:p-9">
      <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 bg-white/70" aria-hidden />
      <p className="text-[10px] font-semibold tracking-[0.3em] uppercase opacity-70">Joke of the visit</p>
      <p className="mt-3 font-h2 text-2xl leading-tight md:text-3xl">{j.q}</p>
      <button data-plain onClick={() => setShown(true)} className="mt-4 block text-left" aria-live="polite">
        {shown ? (
          <span className="joke-pop block font-hand text-3xl leading-tight md:text-4xl">{j.a}</span>
        ) : (
          <span className="inline-block rounded-full bg-black px-5 py-2 text-xs tracking-[0.2em] text-white uppercase">Go on then →</span>
        )}
      </button>
      {shown && (
        <button data-plain onClick={another} className="mt-5 text-xs tracking-[0.2em] uppercase underline underline-offset-4">Another one</button>
      )}
    </div>
  );
}
