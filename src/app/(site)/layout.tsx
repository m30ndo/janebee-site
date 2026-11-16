import { Strapline } from "@/components/Strapline";
import Link from "next/link";
import { BasketLink } from "@/components/shop/AddToBasket";
import { SiteMenu } from "@/components/SiteMenu";
import { menuItems } from "@/lib/menu";

const nav = menuItems.filter((m) => m.href !== "/the-hive");

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
          <BasketLink />
          <SiteMenu />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-20 border-t border-white/10 bg-black px-6 pt-16 pb-10 text-white md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <p className="max-w-md font-serif text-3xl leading-tight font-light italic md:text-4xl">
            Never going to be everyone&apos;s cup of tea. More of an <span className="text-honey">espresso</span> girl.
          </p>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm md:grid-cols-3">
            {menuItems.map((n) => (
              <Link key={n.href} href={n.href} className="link-draw opacity-80 hover:opacity-100">{n.label}</Link>
            ))}
            <Link href="/members" className="link-draw text-honey opacity-90 hover:opacity-100">The Hive app</Link>
            <a href="https://www.instagram.com/janeybee.art/" target="_blank" rel="noopener" className="link-draw opacity-80 hover:opacity-100">Instagram</a>
          </nav>
        </div>
        <Strapline className="mt-14 text-white/80" />
        <p className="mt-4 text-xs tracking-[0.18em] uppercase opacity-50">© 2026 Jane Bee · Every piece holds a memory</p>
      </footer>
    </div>
  );
}
