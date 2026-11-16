import Link from "next/link";
import { BasketLink } from "@/components/shop/AddToBasket";

const nav = [
  { href: "/gallery", label: "Gallery" },
  { href: "/shop", label: "Shop" },
  { href: "/members", label: "The Hive" },
];

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="font-serif text-2xl font-light tracking-tight">
          Jane Bee
        </Link>
        <nav className="flex gap-6 text-sm tracking-[0.15em] uppercase">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-honey">
              {n.label}
            </Link>
          ))}
          <BasketLink />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="flex flex-wrap items-end justify-between gap-6 px-6 py-10 text-sm md:px-12">
        <p className="max-w-xs font-serif text-xl font-light italic">
          Never going to be everyone&apos;s cup of tea. More of an espresso girl.
        </p>
        <div className="flex gap-6 text-xs tracking-[0.15em] uppercase">
          <a href="https://www.instagram.com/janeybee.art/" target="_blank" rel="noopener" className="hover:text-honey">
            Instagram
          </a>
          <span className="opacity-60">© {2026} Jane Bee</span>
        </div>
      </footer>
    </div>
  );
}
