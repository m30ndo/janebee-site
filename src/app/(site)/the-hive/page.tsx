import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageBackground } from "@/components/PageBackground";
import { HiveForm } from "@/components/HiveForm";
import { Reveal } from "@/components/Reveal";
import { PhoneShowcase } from "@/components/hive/PhoneShowcase";
import { InstallGuide } from "@/components/hive/InstallGuide";

export const metadata: Metadata = {
  title: "The Hive app",
  description: "Jane Bee's members app: first look at new paintings and prints, private-view invitations, the diary and the walk-through gallery, on your home screen.",
};

const icon = (d: ReactNode) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);

const benefits = [
  { title: "First look, before anyone", text: "New paintings land in the app before they reach the website or Instagram. If one speaks to you, it can be yours first.", icon: icon(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>) },
  { title: "Prints, Hive first", text: "Limited prints go on sale to members early, while every size is still in stock.", icon: icon(<><rect x="4" y="3" width="16" height="18" /><path d="M4 15l5-5 4 4 2-2 5 5" /></>) },
  { title: "Invitations & RSVP", text: "Private views, launches and studio evenings. Say you're coming, and bring a friend, in a tap.", icon: icon(<><path d="M3 7h18v13H3z" /><path d="M3 7l9 7 9-7" /></>) },
  { title: "The diary", text: "Where to see the work in real life: exhibitions, dates, opening times and directions.", icon: icon(<><rect x="4" y="5" width="16" height="15" /><path d="M4 10h16M9 3v4M15 3v4" /></>) },
  { title: "Walk the gallery", text: "The 3D gallery, the stories Bee-hind each painting and the journal, all inside the app, with music if you want it.", icon: icon(<><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-7h6v7" /></>) },
  { title: "Free, and nothing to update", text: "No App Store, no fees. It installs straight from the website in seconds and is always the latest version.", icon: icon(<><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M4 21h16" /></>) },
];

const faqs = [
  { q: "Is it really an app?", a: "Yes, a web app. Once it's on your home screen it opens full screen with its own icon, just like an app from the App Store, without taking up much space." },
  { q: "Does it cost anything?", a: "No. Joining the Hive is free. You only pay if you buy a painting or print." },
  { q: "Do I need an account?", a: "Yes, so we know you're a member. Open the app, tap Join the Hive and choose a password. It takes a minute." },
  { q: "I added it but it opens in the browser", a: "Delete the icon, then add it again following the steps above. On iPhone, make sure Open as Web App is switched on." },
];

/** The Hive: what the members app is, why to get it, and how to install it. */
export default function HivePage() {
  return (
    <div>
      <PageBackground page="the-hive" />

      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-14 pb-20 md:px-12 md:pt-20 md:pb-28">
        <div className="grid items-center gap-16 md:grid-cols-[1.1fr_1fr]">
          <div className="stagger">
            <p className="text-xs tracking-[0.3em] text-honey uppercase">The Hive app</p>
            <h1 className="mt-5 font-title text-[15vw] leading-[0.9] font-light md:text-8xl lg:text-9xl">
              Jane&apos;s world,<br /><span className="italic text-honey">in your pocket.</span>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed opacity-80">
              The Hive is Jane Bee&apos;s members app. New paintings and prints land there first, along with invitations, the diary and the walk-through gallery. It&apos;s free, and it lives on your home screen.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/signin" className="btn-glass bg-honey px-8 py-4 font-medium text-black transition-colors hover:bg-white">Open the app →</Link>
              <a href="#install" className="btn-glass border border-white/40 px-8 py-4 font-medium transition-colors hover:border-honey hover:text-honey">How to install ↓</a>
            </div>
          </div>
          <PhoneShowcase />
        </div>
      </section>

      {/* benefits */}
      <section className="border-t border-white/10 px-6 py-20 md:px-12 md:py-28">
        <Reveal>
          <p className="text-xs tracking-[0.3em] text-honey uppercase">Why join</p>
          <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-tight font-light md:text-6xl">Six reasons to put the bee on your home screen.</h2>
        </Reveal>
        <ul className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal as="li" key={b.title} delay={(i % 3) * 120} className="group bg-black p-8 transition-colors duration-500 hover:bg-honey hover:text-black md:p-10">
              <span className="block text-honey transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-black">{b.icon}</span>
              <p className="mt-6 font-serif text-2xl">{b.title}</p>
              <p className="mt-3 leading-relaxed opacity-75 group-hover:opacity-90">{b.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* install */}
      <section id="install" className="scroll-mt-24 border-t border-white/10 px-6 py-20 md:px-12 md:py-28">
        <Reveal className="text-center">
          <p className="text-xs tracking-[0.3em] text-honey uppercase">Install in under a minute</p>
          <h2 className="mt-4 font-serif text-5xl font-light md:text-6xl">How to get the app</h2>
          <p className="mx-auto mt-4 max-w-xl opacity-75">There&apos;s nothing to download from an app store. Open the Hive in your phone&apos;s browser and add it to your home screen.</p>
        </Reveal>
        <div className="mt-14"><InstallGuide /></div>
      </section>

      {/* questions */}
      <section className="border-t border-white/10 px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <Reveal><h2 className="font-serif text-5xl font-light">Good to know</h2></Reveal>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl transition-colors hover:text-honey">
                  {f.q}<span className="text-honey transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-xl leading-relaxed opacity-75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* get it / mailing list */}
      <section className="px-6 md:px-0">
        <Reveal className="bg-honey px-8 py-16 text-black md:px-16 md:py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-end">
            <div>
              <h2 className="font-serif text-6xl leading-[0.9] font-light md:text-8xl">Join<br />the Hive</h2>
              <Link href="/signin" className="btn-glass mt-8 inline-block bg-black px-8 py-4 font-medium text-white">Open the app →</Link>
            </div>
            <div>
              <p className="mb-6 text-lg">Not ready for the app? Get the news by email instead.</p>
              <div className="text-lg [&_form]:max-w-none"><HiveForm source="hive-page" onYellow /></div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
