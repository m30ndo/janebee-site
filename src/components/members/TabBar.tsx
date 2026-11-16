"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const icon = (d: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

const tabs = [
  { href: "/members", label: "Home", icon: icon(<><path d="M12 3l1.8 5.6H19l-4.6 3.3 1.8 5.6L12 14.2 7.8 17.5l1.8-5.6L5 8.6h5.2z" /></>) },
  { href: "/members/gallery", label: "Gallery", icon: icon(<><rect x="3" y="4" width="18" height="16" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></>) },
  { href: "/members/shop", label: "Shop", icon: icon(<><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>) },
  { href: "/members/journal", label: "Journal", icon: icon(<><path d="M5 4h11l3 3v13H5z" /><path d="M8 10h8M8 14h8M8 18h5" /></>) },
  { href: "/members/account", label: "You", icon: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>) },
];

/** App-style bottom navigation: everything stays inside the app. */
export function TabBar() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/members"
      ? path === "/members" || path.startsWith("/members/events")
      : path.startsWith(href) || (href === "/members/shop" && (path.startsWith("/members/basket") || path.startsWith("/members/work")));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cream/10 bg-espresso/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex h-16 max-w-xl items-stretch justify-around">
        {tabs.map((t) => {
          const on = active(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`group relative flex h-full flex-col items-center justify-center gap-1 text-[10px] tracking-[0.14em] uppercase transition-colors ${on ? "text-honey" : "text-cream/65 hover:text-cream"}`}
              >
                <span className={`absolute top-0 h-0.5 rounded-full bg-honey transition-all duration-500 ${on ? "w-8 opacity-100" : "w-0 opacity-0"}`} />
                <span className={`transition-transform duration-300 ${on ? "-translate-y-0.5 scale-110" : "group-hover:-translate-y-0.5"}`}>{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
