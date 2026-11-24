"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JOKES, freshIndex, moodFor } from "@/lib/daily";

/**
 * The app's front door. The greeting follows the day ("Happy Friday") and the
 * line under it changes every visit.
 */
export function HomeHero({ firstName }: { firstName: string | null }) {
  const [mood, setMood] = useState<{ hello: string; line: string; timeOfDay: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const m = moodFor();
      setMood({ hello: m.hello, timeOfDay: m.timeOfDay, line: m.lines[freshIndex(`hive-line-${m.hello}`, m.lines.length)] });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const helloLen = mood ? mood.hello.split(" ").length : 0;
  const words = mood ? `${mood.hello}${firstName ? `, ${firstName}` : ""}.`.split(" ") : [];

  return (
    <section className="pt-14 md:pt-24">
      <p className="text-[11px] font-semibold tracking-[0.3em] text-honey uppercase">{mood ? `${mood.timeOfDay} · in the Hive` : "\u00a0"}</p>
      <h1 key={mood?.hello ?? "x"} className="word-in mt-4 font-title text-[14vw] leading-[0.9] font-light tracking-tight md:text-8xl">
        {mood ? words.map((w, n) => (
          <span key={n} style={{ animationDelay: `${0.1 + n * 0.12}s` }} className={n >= (firstName ? helloLen : helloLen - 1) ? "italic text-honey" : ""}>
            {w}{n < words.length - 1 ? "\u00a0" : ""}
          </span>
        )) : <span className="opacity-0">Hello.</span>}
      </h1>
      <p className="mt-5 max-w-md text-lg leading-snug text-white/85 md:text-xl" style={{ minHeight: "1.5em" }}>
        {mood?.line}
      </p>
      <div className="mt-8">
        <Link href="/members/gallery" className="btn-glass inline-block bg-honey px-7 py-3.5 font-medium text-black">Walk the gallery →</Link>
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
