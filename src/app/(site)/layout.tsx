import Link from "next/link";
import { Suspense } from "react";
import { getTracks } from "@/lib/data";
import { MusicCornerButton, MusicTracks } from "@/components/MusicPlayer";
import { BeeIcon } from "@/components/BeeIcon";
import { BasketLink } from "@/components/shop/AddToBasket";
import { SiteMenu } from "@/components/SiteMenu";
import { menuItems } from "@/lib/menu";
import { CONTACT, SOCIALS } from "@/lib/contact";
import { SHIPPING } from "@/lib/shop";
import { HiveForm } from "@/components/HiveForm";
import { LEGAL_LINKS } from "@/lib/legal-links";
import { CookieNotice } from "@/components/CookieNotice";
import { BasketSync } from "@/components/shop/BasketSync";

/** Footer credit. */
const DESIGNER_URL = "https://www.distinktivedesign.co.uk";

/** The playlist follows visitors around the website, same as in the app. */
async function SiteTracks() {
  return <MusicTracks tracks={await getTracks()} />;
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-5 text-[11px] font-semibold tracking-[0.28em] text-honey uppercase">{title}</h2>
      {children}
    </div>
  );
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="hive-app isolate flex min-h-dvh flex-col bg-black text-white">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md md:px-12">
        <Link href="/" className="group flex items-center gap-3 font-hand text-3xl leading-none md:text-4xl">
          <img src="/logo" alt="" width={40} height={40} className="h-9 w-9 md:h-10 md:w-10" />
          <span>Jane <span className="transition-colors group-hover:text-honey">Bee</span></span>
        </Link>
        <nav className="flex items-center gap-6 text-xs tracking-[0.18em] uppercase md:gap-8">
          <BasketLink onlyWhenFull />
          <SiteMenu />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="relative z-10 mt-20 overflow-hidden bg-black pb-24 text-white md:pb-10">
        <div className="px-6 py-10 text-center md:px-12 md:py-14">
          <p className="mx-auto max-w-5xl font-hand text-[1.8rem] leading-tight md:text-5xl">
            Never going to be everyone&apos;s cup of tea. More of an <span className="text-honey">espresso</span> girl.
          </p>
        </div>

        {/* phones: stacked · tablet portrait: 2 × 2 · tablet landscape & desktop: 4 columns */}
        <div className="grid grid-cols-1 gap-12 px-6 pt-10 sm:grid-cols-2 md:px-12 lg:grid-cols-[1fr_1fr_0.8fr_1.3fr] lg:gap-10 xl:gap-16">
          <FooterCol title="Say hello">
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="link-draw opacity-80 hover:opacity-100">Send Jane a message</Link></li>
              <li><Link href="/contact" className="link-draw opacity-80 hover:opacity-100">Commissions &amp; collaborations</Link></li>
              {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`} className="link-draw opacity-80 hover:opacity-100">{CONTACT.email}</a></li>}
              {CONTACT.location && <li className="opacity-60">{CONTACT.location}</li>}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-3">
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 border border-white/25 px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors hover:border-honey hover:bg-honey hover:text-black"
                  >
                    {s.label} <span className="normal-case tracking-normal opacity-70">{s.handle}</span> ↗
                  </a>
                </li>
              ))}
            </ul>
          </FooterCol>

          <FooterCol title="The shop">
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/shop#prints" className="link-draw opacity-80 hover:opacity-100">Prints &amp; more</Link></li>
              <li><Link href="/basket" className="link-draw opacity-80 hover:opacity-100">Your basket</Link></li>
              {LEGAL_LINKS.map((l) => (
                <li key={l.slug}><Link href={`/legal/${l.slug}`} className="link-draw opacity-80 hover:opacity-100">{l.title}</Link></li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 text-xs leading-relaxed opacity-60">
              <div><dt className="inline">Prints: </dt><dd className="inline">{SHIPPING.prints.label}, £{(SHIPPING.prints.pence / 100).toFixed(2)}</dd></div>
              <div><dt className="inline">Originals: </dt><dd className="inline">{SHIPPING.originals.label}, £{(SHIPPING.originals.pence / 100).toFixed(2)}</dd></div>
              <div><dd>Secure checkout with Stripe. UK delivery for now.</dd></div>
            </dl>
          </FooterCol>

          <FooterCol title="Pages">
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="link-draw opacity-80 hover:opacity-100">Home</Link></li>
              {menuItems.map((n) => (
                <li key={n.href}><Link href={n.href} className="link-draw opacity-80 hover:opacity-100">{n.label}</Link></li>
              ))}
              <li><Link href="/members" className="link-draw text-honey opacity-90 hover:opacity-100">The Hive app</Link></li>
            </ul>
          </FooterCol>

          <FooterCol title="Join the Hive">
            <p className="mb-5 max-w-sm text-sm leading-relaxed opacity-80">
              The newsletter. New work before it hits Instagram, first dibs on originals, and invitations to the good parties.
            </p>
            <HiveForm source="footer" />
          </FooterCol>
        </div>

        <div className="mt-16 px-6 md:px-12">
          <div className="flex flex-col items-center gap-6 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-center gap-3 md:items-start">
              <p className="text-center text-xs tracking-[0.18em] uppercase opacity-60 md:text-left">
                © 2026 Jane Bee · Design by{" "}
                <a href={DESIGNER_URL} target="_blank" rel="noopener" className="link-draw opacity-100 hover:text-honey">Distinktive Design</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}><SiteTracks /></Suspense>
      <CookieNotice />
      <BasketSync />
      {/* bottom-right corner: music and the Studio bee, music and the buzzing bee */}
      <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex items-center gap-2.5 md:right-5 md:bottom-5">
        <MusicCornerButton />
        <Link
          href="/admin"
          aria-label="Studio"
          title="Studio"
          className="group grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/70 text-honey shadow-[0_2px_10px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-honey"
        >
          <img src="/logo" alt="" width={26} height={26} className="h-[26px] w-[26px] transition-transform duration-300 group-hover:rotate-12" />
        </Link>
      </div>
    </div>
  );
}
