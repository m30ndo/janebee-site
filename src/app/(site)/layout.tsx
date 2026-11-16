import Link from "next/link";
import { BasketLink } from "@/components/shop/AddToBasket";

const nav = [
  { href: "/gallery", label: "Gallery" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/members", label: "The Hive" },
];

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-cream/80 px-6 py-4 backdrop-blur-md md:px-12">
        <Link href="/" className="group font-serif text-2xl font-light tracking-tight">
          Jane <span className="transition-colors group-hover:text-honey">Bee</span>
        </Link>
        <nav className="flex items-center gap-5 text-xs tracking-[0.18em] uppercase md:gap-8 md:text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="link-draw hidden py-1 sm:inline">
              {n.label}
            </Link>
          ))}
          <Link href="/gallery" className="link-draw py-1 sm:hidden">Gallery</Link>
          <BasketLink />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-20 bg-espresso px-6 pt-16 pb-10 text-cream md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <p className="max-w-md font-serif text-3xl leading-tight font-light italic md:text-4xl">
            Never going to be everyone&apos;s cup of tea. More of an <span className="text-honey">espresso</span> girl.
          </p>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="link-draw opacity-80 hover:opacity-100">{n.label}</Link>
            ))}
            <a href="https://www.instagram.com/janeybee.art/" target="_blank" rel="noopener" className="link-draw opacity-80 hover:opacity-100">Instagram</a>
          </nav>
        </div>
        <p className="mt-14 text-xs tracking-[0.18em] uppercase opacity-50">© 2026 Jane Bee · Every piece holds a memory</p>
      </footer>
    </div>
  );
}
