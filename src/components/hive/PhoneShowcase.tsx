"use client";

import { useEffect, useState, type ReactNode } from "react";

/** A phone frame. Children fill the screen. */
export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative aspect-[9/19.5] rounded-[2.6rem] border-[7px] border-[#1c1c1e] bg-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] ${className}`}>
      <div className="absolute top-2 left-1/2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1c1c1e]" />
      <div className="absolute inset-0 overflow-hidden rounded-[2.1rem]">{children}</div>
    </div>
  );
}

const Bee = ({ className = "" }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/brand/hive-logo.svg" alt="" className={className} />
);

function TabBarMock({ on }: { on: number }) {
  const items = ["Home", "Gallery", "Shop", "Diary", "Journal", "Music", "You"];
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[11%] items-start justify-around border-t border-white/10 bg-black/95 pt-[3%] text-[5.5px] tracking-[0.08em] uppercase">
      {items.map((t, i) => (
        <span key={t} className={`flex flex-col items-center gap-1 ${i === on ? "text-honey" : "text-white/55"}`}>
          <span className={`block h-2.5 w-2.5 border ${i === on ? "border-honey" : "border-white/50"}`} />
          {t}
        </span>
      ))}
    </div>
  );
}

const Header = () => (
  <div className="flex items-center justify-between px-[7%] pt-[13%] pb-[3%] text-[10px]">
    <span className="font-serif text-[13px] font-light">The <span className="text-honey">Hive</span></span>
    <span className="text-[6px] tracking-[0.15em] uppercase opacity-60">Sarah</span>
  </div>
);

/** Sample app screens: illustrations of the real app with made-up content. */
const screens: { label: string; screen: ReactNode }[] = [
  {
    label: "First look",
    screen: (
      <div className="h-full bg-black text-white">
        <Header />
        <div className="px-[7%] pt-[10%]">
          <p className="text-[6px] tracking-[0.25em] uppercase opacity-60">Afternoon, Sarah</p>
          <p className="mt-2 font-serif text-[26px] leading-[0.95] font-light">First look,<br /><span className="text-honey italic">before anyone.</span></p>
          <p className="mt-3 text-[7.5px] leading-relaxed opacity-70">New paintings, prints and invitations land here first.</p>
          <span className="mt-4 inline-block bg-honey px-3 py-1.5 text-[7px] font-medium text-black">Walk the gallery →</span>
          <div className="mt-6 bg-honey p-3 text-black">
            <p className="text-[5.5px] tracking-[0.25em] uppercase opacity-70">You&apos;re invited</p>
            <p className="mt-1 font-serif text-[13px] leading-tight">Private view</p>
            <p className="text-[6.5px]">Fri 12 Dec · 7pm</p>
          </div>
        </div>
        <TabBarMock on={0} />
      </div>
    ),
  },
  {
    label: "Walk the gallery",
    screen: (
      <div className="relative h-full overflow-hidden bg-[#8d8a85] text-white">
        {/* a simple room in perspective */}
        <div className="absolute inset-x-0 top-0 h-[24%] bg-[#141414]" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-[#bdbab4] to-[#dcd9d3]" />
        <div className="absolute top-[24%] left-[18%] h-[46%] w-[64%] bg-[#9c9993]" />
        <div className="absolute top-[30%] left-[29%] w-[42%] border-[3px] border-black bg-white p-[2px] shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/espresso-served.jpg" alt="" className="aspect-[4/5] w-full object-cover" />
          <Bee className="absolute right-1 bottom-1 h-2.5 w-2.5 opacity-80" />
        </div>
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 border border-honey bg-black px-2 py-0.5 font-serif text-[7px] tracking-[0.12em]">MORNING AFTER</div>
        <div className="absolute inset-x-[7%] bottom-[14%] bg-black/85 p-2.5 backdrop-blur">
          <p className="text-[5.5px] tracking-[0.2em] text-honey uppercase">No. 001 · One of one</p>
          <p className="font-serif text-[12px]">Espresso, Served</p>
          <p className="mt-0.5 text-[6.5px] italic opacity-70">Never everyone&apos;s cup of tea.</p>
        </div>
        <div className="absolute top-[13%] left-[7%] font-serif text-[13px] font-light">The <span className="text-honey">Hive</span></div>
        <TabBarMock on={1} />
      </div>
    ),
  },
  {
    label: "The diary",
    screen: (
      <div className="h-full bg-black text-white">
        <Header />
        <div className="px-[7%] pt-[6%]">
          <p className="font-serif text-[20px] font-light">Diary</p>
          <p className="mt-3 flex items-center gap-2 text-[6px] tracking-[0.25em] text-honey uppercase">December 2026<span className="h-px flex-1 bg-white/15" /></p>
          {[
            { d: "12", m: "Dec", w: "Fri", t: "Private view", s: "Hive invitation", c: "text-grey", on: false },
            { d: "14", m: "Dec", w: "Sun", t: "Winter group show", s: "Showing", c: "text-honey", on: true },
          ].map((e) => (
            <div key={e.d} className="mt-3 grid grid-cols-[2.2rem_1fr] gap-2">
              <div className={`flex h-9 flex-col items-center justify-center border text-[5px] uppercase ${e.on ? "border-honey bg-honey text-black" : "border-white/25"}`}>
                <span className="opacity-70">{e.w}</span><span className="font-serif text-[13px] leading-none">{e.d}</span><span>{e.m}</span>
              </div>
              <div className="border border-white/15 p-2">
                <p className={`text-[5px] tracking-[0.2em] uppercase ${e.c}`}>{e.s}</p>
                <p className="font-serif text-[10px]">{e.t}</p>
                <p className="text-[6px] opacity-60">Tue–Sat 10am–5pm</p>
              </div>
            </div>
          ))}
        </div>
        <TabBarMock on={3} />
      </div>
    ),
  },
  {
    label: "Prints first",
    screen: (
      <div className="h-full bg-black text-white">
        <Header />
        <div className="px-[7%] pt-[6%]">
          <p className="font-serif text-[20px] font-light">Shop</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {["/art/placeholder-1.jpg", "/art/placeholder-4.jpg", "/art/placeholder-2.jpg", "/art/placeholder-5.jpg"].map((src, i) => (
              <div key={src}>
                <div className="relative aspect-square bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i < 2 && <span className="absolute top-1 left-1 bg-grey px-1 text-[5px] text-white">Hive first</span>}
                </div>
                <p className="mt-1 text-[6.5px]">Print No. {i + 3}</p>
                <p className="text-[6px] opacity-60">from £45</p>
              </div>
            ))}
          </div>
        </div>
        <TabBarMock on={2} />
      </div>
    ),
  },
];

/** The app in a phone: screens slide by on their own; tap the dots to pick one. */
export function PhoneShowcase() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % screens.length), 3600);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="flex flex-col items-center" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hive-float relative w-[230px] md:w-[270px]">
        <span className="pointer-events-none absolute -inset-16 -z-10 rounded-full bg-honey/20 blur-3xl" />
        <Phone>
          <div className="flex h-full transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
            {screens.map((s) => (
              <div key={s.label} className="relative h-full w-full shrink-0">{s.screen}</div>
            ))}
          </div>
        </Phone>
      </div>
      <p className="mt-8 h-5 text-xs tracking-[0.25em] text-honey uppercase" aria-live="polite">{screens[i].label}</p>
      <div className="mt-3 flex gap-2">
        {screens.map((s, n) => (
          <button key={s.label} data-plain onClick={() => setI(n)} aria-label={s.label} className={`h-1.5 transition-all duration-500 ${n === i ? "w-8 bg-honey" : "w-3 bg-white/30 hover:bg-white/60"}`} />
        ))}
      </div>
    </div>
  );
}
