import { STRAPLINE } from "@/components/Strapline";
import Link from "next/link";
import { BasketLink } from "@/components/shop/AddToBasket";
import { SiteMenu } from "@/components/SiteMenu";
import { menuItems } from "@/lib/menu";

const nav = menuItems.filter((m) => m.href !== "/the-hive");

/** Footer credit. */
const DESIGNER_URL = "https://www.distinktivedesign.co.uk";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md md:px-12">
        <Link href="/" className="group font-serif text-2xl font-light tracking-tight">
          Jane <span className="transition-colors group-hover:text-honey">Bee</span>
        </Link>
        <nav className="flex items-center gap-5 text-xs tracking-[0.18em] uppercase md:gap-8 md:text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="link-draw hidden py-1 md:inline">
              {n.label}
            </Link>
          ))}
          <BasketLink phoneOnlyWhenFull />
          <SiteMenu />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-20 overflow-hidden border-t border-white/10 bg-black pb-10 text-white">
        <div className="border-b border-white/10 px-6 py-10 text-center md:px-12 md:py-14">
          <p className="mx-auto max-w-5xl font-serif text-3xl leading-tight font-light italic md:text-5xl">
            Never going to be everyone&apos;s cup of tea. More of an <span className="text-honey">espresso</span> girl.
          </p>
        </div>

        <div className="px-6 pt-14 md:px-12">
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm md:flex md:flex-wrap md:gap-x-10">
            {menuItems.map((n) => (
              <Link key={n.href} href={n.href} className="link-draw opacity-80 hover:opacity-100">{n.label}</Link>
            ))}
            <Link href="/members" className="link-draw text-honey opacity-90 hover:opacity-100">The Hive app</Link>
            <a href="https://www.instagram.com/janeybee.art/" target="_blank" rel="noopener" className="link-draw opacity-80 hover:opacity-100">Instagram</a>
          </nav>

          <div className="mt-14 flex justify-center">
            <div className="shake-every inline-block max-w-full bg-honey px-4 py-3 text-black sm:px-5 md:px-7 md:py-4">
              <p className="text-[9px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase min-[400px]:text-[11px] min-[400px]:tracking-[0.2em] sm:text-sm sm:tracking-[0.3em]" aria-label={STRAPLINE.join(", ")}>
                {STRAPLINE.map((w, i) => (
                  <span key={w}>
                    {i > 0 && <span className="mx-1.5 text-white min-[400px]:mx-2 sm:mx-3" aria-hidden>●</span>}
                    {w}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
            <p className="order-2 text-center text-xs tracking-[0.18em] uppercase opacity-60 md:order-1 md:text-left">
              © 2026 Jane Bee · Design by{" "}
              <a href={DESIGNER_URL} target="_blank" rel="noopener" className="link-draw opacity-100 hover:text-honey">Distinktive Design</a>
            </p>
            <Link href="/admin" aria-label="Studio" className="order-1 transition-transform hover:-translate-y-0.5 hover:rotate-6 md:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/hive-logo.svg" alt="" width={36} height={36} className="h-9 w-9" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
