"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/members", label: "New", icon: "✦" },
  { href: "/gallery", label: "Gallery", icon: "◫" },
  { href: "/members/events", label: "Invites", icon: "✉" },
  { href: "/members/orders", label: "Orders", icon: "◎" },
  { href: "/members/account", label: "You", icon: "◉" },
];

/** App-style bottom navigation. */
export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cream/10 bg-espresso/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-3xl justify-around">
        {tabs.map((t) => {
          const active = t.href === "/members" ? path === "/members" : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-[11px] tracking-[0.1em] uppercase ${active ? "text-honey" : "opacity-70"}`}>
                <span aria-hidden className="text-lg leading-none">{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
