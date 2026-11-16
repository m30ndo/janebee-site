"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="mt-6 flex gap-4 overflow-x-auto text-sm md:flex-col md:gap-1">
      {items.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`relative rounded-lg py-1.5 whitespace-nowrap transition-colors md:px-3 ${
              active ? "font-medium text-honey md:bg-white/[0.06]" : "text-white/70 hover:text-white md:hover:bg-white/[0.06]"
            }`}
          >
            {active && <span className="absolute top-1/2 -left-5 hidden h-5 w-[3px] -translate-y-1/2 rounded-r bg-honey md:block" />}
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
