import { FooterStrapline } from "@/components/FooterStrapline";
import Link from "next/link";
import { Suspense } from "react";
import { getTracks } from "@/lib/data";
import { MusicFloating, MusicTracks } from "@/components/MusicPlayer";
import { BasketLink } from "@/components/shop/AddToBasket";
import { SiteMenu } from "@/components/SiteMenu";
import { menuItems } from "@/lib/menu";
import { CONTACT, SOCIALS } from "@/lib/contact";
import { SHIPPING } from "@/lib/shop";
import { HiveForm } from "@/components/HiveForm";

/** Footer credit. */
const DESIGNER_URL = "https://www.distinktivedesign.co.uk";

/** The music player follows visitors around the website, same as in the app. */
async function SitePlayer() {
  const tracks = await getTracks();
  return (
    <>
      <MusicTracks tracks={tracks} />
      <MusicFloating bottom={20} />
    </>
  );
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
        <Link href="/" className="group font-serif text-2xl font-light tracking-tight">
          Jane <span className="transition-colors group-hover:text-honey">Bee</span>
        </Link>
        <nav className="flex items-center gap-6 text-xs tracking-[0.18em] uppercase md:gap-8">
          <BasketLink onlyWhenFull />
          <SiteMenu />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="relative z-10 mt-20 overflow-hidden bg-black pb-10 text-white">
        <div className="px-6 py-10 text-center md:px-12 md:py-14">
          <p className="mx-auto max-w-5xl font-serif text-3xl leading-tight font-light italic md:text-5xl">
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
              <li><Link href="/shop#originals" className="link-draw opacity-80 hover:opacity-100">Originals · one of one</Link></li>
              <li><Link href="/shop#prints" className="link-draw opacity-80 hover:opacity-100">Prints &amp; more</Link></li>
              <li><Link href="/basket" className="link-draw opacity-80 hover:opacity-100">Your basket</Link></li>
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
          {/* phones: full width like the Join the Hive box · tablets: edge to edge · desktop: centred */}
          <div className="md:-mx-12 lg:mx-0 lg:flex lg:justify-center">
            <FooterStrapline />
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
            <p className="order-2 text-center text-xs tracking-[0.18em] uppercase opacity-60 md:order-1 md:text-left">
              © 2026 Jane Bee · Design by{" "}
              <a href={DESIGNER_URL} target="_blank" rel="noopener" className="link-draw opacity-100 hover:text-honey">Distinktive Design</a>
            </p>
            {/* phones: the Studio bee sits centred here; bigger screens have it fixed bottom-right */}
            <Link href="/admin" aria-label="Studio" className="order-1 transition-transform hover:-translate-y-0.5 hover:rotate-6 md:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/hive-logo.svg" alt="" width={36} height={36} className="h-9 w-9" />
            </Link>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}><SitePlayer /></Suspense>
      {/* tablets & desktops: the Studio (CRM) bee, always in the bottom-right corner */}
      <Link
        href="/admin"
        aria-label="Studio"
        className="fixed right-5 bottom-5 z-30 hidden opacity-70 transition-all duration-300 hover:-translate-y-0.5 hover:rotate-6 hover:opacity-100 md:block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/hive-logo.svg" alt="" width={36} height={36} className="h-9 w-9 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
      </Link>
    </div>
  );
}
