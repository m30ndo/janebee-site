"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Phone } from "@/components/hive/PhoneShowcase";

type Platform = "iphone" | "android" | "computer";
type Scene = "browser" | "menu" | "sheet" | "dialog" | "home" | "desktop" | "desktop-install" | "desktop-app";
type Step = { title: string; text: ReactNode; scene: Scene };

const URL = "janebee.co.uk";

const guides: Record<Platform, { label: string; note: ReactNode; steps: Step[] }> = {
  iphone: {
    label: "iPhone & iPad",
    note: <>On older iPhones (before iOS 26) the Share button sits in the bar at the bottom of Safari: tap it, then <b>Add to Home Screen</b>, then <b>Add</b>.</>,
    steps: [
      { title: "Open in Safari", text: <>Go to <b>{URL}/signin</b> in Safari.</>, scene: "browser" },
      { title: "Tap ⋯ then Share", text: <>Tap the three dots beside the address bar, then <b>Share</b>.</>, scene: "menu" },
      { title: "Add to Home Screen", text: <>Scroll down the list and tap <b>Add to Home Screen</b>.</>, scene: "sheet" },
      { title: "Tap Add", text: <>Leave <b>Open as Web App</b> switched on and tap <b>Add</b>.</>, scene: "dialog" },
      { title: "Find the bee", text: <>The Hive is on your Home Screen. Tap the bee and sign in.</>, scene: "home" },
    ],
  },
  android: {
    label: "Android",
    note: <>Using Samsung Internet? Tap the menu (☰) at the bottom, then <b>Add page to</b> → <b>Home screen</b>.</>,
    steps: [
      { title: "Open in Chrome", text: <>Go to <b>{URL}/signin</b> in Chrome.</>, scene: "browser" },
      { title: "Tap ⋮", text: <>Tap the three dots at the top right.</>, scene: "menu" },
      { title: "Install app", text: <>Tap <b>Install app</b> (or <b>Add to Home screen</b>).</>, scene: "sheet" },
      { title: "Tap Install", text: <>Confirm with <b>Install</b>.</>, scene: "dialog" },
      { title: "Find the bee", text: <>The Hive is with your apps. Tap the bee and sign in.</>, scene: "home" },
    ],
  },
  computer: {
    label: "Computer",
    note: <>On a Mac with Safari, choose <b>File</b> → <b>Add to Dock</b> instead.</>,
    steps: [
      { title: "Open in Chrome or Edge", text: <>Go to <b>{URL}/signin</b>.</>, scene: "desktop" },
      { title: "Click the install icon", text: <>Click the small install icon at the right of the address bar, then <b>Install</b>.</>, scene: "desktop-install" },
      { title: "Open The Hive", text: <>It opens in its own window and stays in your apps or Dock.</>, scene: "desktop-app" },
    ],
  },
};

/** A pulsing ring that marks where to tap. */
const Tap = ({ className = "" }: { className?: string }) => (
  <span className={`pointer-events-none absolute z-10 ${className}`} aria-hidden>
    <span className="absolute inset-0 animate-ping rounded-full bg-honey/60" />
    <span className="absolute inset-0 rounded-full border-2 border-honey" />
  </span>
);

const BeeIcon = ({ className = "" }: { className?: string }) => (
  <span className={`grid place-items-center bg-black ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/brand/hive-logo.svg" alt="" className="h-[70%] w-[70%]" />
  </span>
);

function SignInPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-black text-white">
      <BeeIcon className="h-9 w-9" />
      <p className="mt-2 font-serif text-[15px] font-light">The <span className="text-honey">Hive</span></p>
      <span className="mt-3 h-1 w-24 bg-white/20" />
      <span className="mt-2 h-1 w-24 bg-white/20" />
      <span className="mt-3 h-3 w-24 bg-honey" />
    </div>
  );
}

function PhoneScene({ platform, scene }: { platform: Platform; scene: Scene }) {
  const ios = platform === "iphone";
  if (scene === "home") {
    return (
      <div className="h-full bg-gradient-to-b from-[#3b3b44] to-[#18181c] px-3 pt-12">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 11 }, (_, i) => <span key={i} className="aspect-square rounded-[22%] bg-white/15" />)}
          <span className="flex flex-col items-center gap-1">
            <BeeIcon className="hive-bounce aspect-square w-full rounded-[22%]" />
            <span className="text-[6px] text-white">The Hive</span>
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-full bg-[#111]">
      {/* Android: address bar at the top */}
      {!ios && (
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 bg-[#1f1f1f] px-2 pt-8 pb-1.5">
          <span className={`relative flex-1 truncate rounded-full bg-white/10 px-2 py-1 text-[7px] text-white/80 ${scene === "browser" ? "ring-2 ring-honey" : ""}`}>{URL}/signin</span>
          <span className="relative px-1 text-[11px] leading-none text-white">⋮{scene === "menu" && <Tap className="-inset-2" />}</span>
        </div>
      )}
      <div className={`absolute inset-x-0 ${ios ? "top-0 bottom-12" : "top-16 bottom-0"}`}><SignInPage /></div>
      {/* iPhone (iOS 26): address bar at the bottom with the ⋯ button */}
      {ios && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-1.5 bg-[#1f1f1f]/95 px-2 pt-2 pb-4">
          <span className={`relative flex-1 truncate rounded-full bg-white/10 px-2 py-1 text-center text-[7px] text-white/80 ${scene === "browser" ? "ring-2 ring-honey" : ""}`}>{URL}</span>
          <span className="relative grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[9px] text-white">⋯{scene === "menu" && <Tap className="-inset-1.5" />}</span>
        </div>
      )}
      {scene === "sheet" && (
        <div className={`z-20 bg-[#2a2a2e] p-2 text-[7px] text-white ${ios ? "animate-[panel-up_.5s_cubic-bezier(.2,.8,.2,1)_both] absolute inset-x-0 bottom-0 rounded-t-2xl pb-4" : "animate-fade absolute top-14 right-2 w-[72%] rounded-lg shadow-2xl"}`}>
          {(ios ? ["Copy", "Add to Reading List", "Add Bookmark", "Add to Home Screen", "Find on Page"] : ["New tab", "Bookmarks", "Install app", "Share…", "Settings"]).map((r) => {
            const hit = r === "Add to Home Screen" || r === "Install app";
            return (
              <span key={r} className={`relative mt-1 block rounded-md px-2 py-1.5 ${hit ? "bg-honey/20 text-honey" : "bg-white/5"}`}>
                {r}{hit && <Tap className="top-1/2 right-2 h-3 w-3 -translate-y-1/2" />}
              </span>
            );
          })}
        </div>
      )}
      {scene === "dialog" && (
        <div className="absolute inset-0 z-20 bg-black/60">
          <div className={`animate-[panel-up_.5s_cubic-bezier(.2,.8,.2,1)_both] absolute inset-x-2 ${ios ? "top-10" : "top-1/3"} rounded-2xl bg-[#2a2a2e] p-3 text-[7px] text-white`}>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Cancel</span>
              <span className="font-medium">{ios ? "Add to Home Screen" : "Install app?"}</span>
              <span className="relative font-semibold text-honey">{ios ? "Add" : ""}{ios && <Tap className="-inset-1.5" />}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <BeeIcon className="h-8 w-8 rounded-lg" />
              <span><span className="block text-[8px]">The Hive</span><span className="text-white/50">{URL}</span></span>
            </div>
            {ios ? (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
                Open as Web App <span className="h-3.5 w-6 rounded-full bg-[#34c759] p-0.5"><span className="ml-auto block h-2.5 w-2.5 rounded-full bg-white" /></span>
              </div>
            ) : (
              <div className="mt-3 flex justify-end">
                <span className="relative rounded-full bg-honey px-3 py-1 font-medium text-black">Install<Tap className="-inset-1" /></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopScene({ scene }: { scene: Scene }) {
  return (
    <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/15 bg-[#1b1b1d] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex gap-1">{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}</span>
        {scene !== "desktop-app" && (
          <span className={`relative ml-2 flex flex-1 items-center justify-between rounded-md bg-white/10 px-2 py-1 text-[8px] text-white/80 ${scene === "desktop" ? "ring-2 ring-honey" : ""}`}>
            {URL}/signin
            <span className="relative text-[9px]">⤓{scene === "desktop-install" && <Tap className="-inset-1.5" />}</span>
          </span>
        )}
        {scene === "desktop-app" && <span className="ml-2 flex items-center gap-1.5 text-[8px] text-white/80"><BeeIcon className="h-3.5 w-3.5" />The Hive</span>}
      </div>
      <div className="relative h-full">
        <SignInPage />
        {scene === "desktop-install" && (
          <div className="animate-[panel-up_.5s_cubic-bezier(.2,.8,.2,1)_both] absolute top-2 right-3 w-40 rounded-lg bg-[#2a2a2e] p-2.5 text-[7px] text-white shadow-xl">
            <p className="font-medium">Install app?</p>
            <div className="mt-2 flex items-center gap-1.5"><BeeIcon className="h-5 w-5" />The Hive</div>
            <div className="mt-2 flex justify-end gap-2"><span className="text-white/60">Cancel</span><span className="relative rounded bg-honey px-2 py-0.5 text-black">Install<Tap className="-inset-1" /></span></div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Step-by-step install, per device, with a little animated screen for each step. */
export function InstallGuide() {
  const [platform, setPlatform] = useState<Platform>("iphone");
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const guide = guides[platform];

  // pick the visitor's own device to start with
  useEffect(() => {
    const ua = navigator.userAgent;
    const t = setTimeout(() => setPlatform(/android/i.test(ua) ? "android" : /iphone|ipad|ipod/i.test(ua) ? "iphone" : "computer"), 0);
    return () => clearTimeout(t);
  }, []);

  // walk through the steps on its own until someone picks one
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % guide.steps.length), 3200);
    return () => clearInterval(t);
  }, [auto, guide.steps.length]);

  const choose = (p: Platform) => { setPlatform(p); setStep(0); setAuto(true); };
  const scene = guide.steps[step]?.scene ?? "browser";

  return (
    <div>
      <div className="mx-auto flex w-fit border border-white/20 p-1 text-xs tracking-[0.15em] uppercase" role="tablist">
        {(Object.keys(guides) as Platform[]).map((p) => (
          <button key={p} role="tab" data-plain aria-selected={platform === p} onClick={() => choose(p)}
            className={`px-4 py-2.5 transition-colors md:px-6 ${platform === p ? "bg-honey text-black" : "text-white/75 hover:text-white"}`}>
            {guides[p].label}
          </button>
        ))}
      </div>

      <div className="mt-12 grid items-center gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <div className="flex justify-center">
          <div key={`${platform}-${scene}`} className="animate-fade w-full max-w-[220px] data-[wide=true]:max-w-md" data-wide={platform === "computer"}>
            {platform === "computer" ? <DesktopScene scene={scene} /> : <Phone><PhoneScene platform={platform} scene={scene} /></Phone>}
          </div>
        </div>

        <ol className="space-y-3">
          {guide.steps.map((s, n) => (
            <li key={s.title}>
              <button data-plain onClick={() => { setStep(n); setAuto(false); }}
                className={`group flex w-full items-start gap-4 border p-4 text-left transition-all duration-500 ${n === step ? "border-honey bg-honey/10" : "border-white/10 hover:border-white/30"}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center font-serif text-lg transition-colors ${n === step ? "bg-honey text-black" : "border border-white/30"}`}>{n + 1}</span>
                <span>
                  <span className={`block font-serif text-xl transition-colors ${n === step ? "text-honey" : ""}`}>{s.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed opacity-80">{s.text}</span>
                </span>
              </button>
            </li>
          ))}
          <li className="pt-2 text-sm leading-relaxed opacity-60">{guide.note}</li>
        </ol>
      </div>
    </div>
  );
}
