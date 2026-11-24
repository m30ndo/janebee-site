"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Item = { href: string; label: string };
const isOn = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

/** Desktop: the sidebar list. */
export function AdminNav({ items }: { items: Item[] }) {
  const path = usePathname();
  return (
    <nav className="mt-6 flex flex-col gap-1 text-sm">
      {items.map((n) => {
        const active = isOn(path, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`relative rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors ${
              active ? "bg-white/[0.06] font-medium text-honey" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {active && <span className="absolute top-1/2 -left-5 h-5 w-[3px] -translate-y-1/2 rounded-r bg-honey" />}
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Phones and small tablets: logo, where you are, and a menu button that opens every section at once. */
export function AdminMobileBar({ items, email, signOut }: { items: Item[]; email: string; signOut: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const current = items.find((n) => isOn(path, n.href))?.label ?? "Studio";

  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) { setLastPath(path); setOpen(false); }

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/admin" aria-label="Studio overview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo" alt="" width={40} height={40} className="h-10 w-10" />
        </Link>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] tracking-[0.2em] text-honey uppercase">Studio</span>
          <span className="block truncate text-base font-medium">{current}</span>
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="flex items-center gap-2 rounded-full border border-honey/70 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-honey uppercase"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h10" /></svg>
          Menu
        </button>
      </div>

      {open && createPortal(
        <div role="dialog" aria-label="Studio menu" className="fixed inset-0 z-[200] flex flex-col bg-black text-white md:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo" alt="" width={40} height={40} className="h-10 w-10" />
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <ul className="grid grid-cols-2 gap-2">
              {items.map((n) => {
                const active = isOn(path, n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-4 py-3.5 text-[15px] ring-1 transition-colors ${active ? "bg-honey font-medium text-black ring-honey" : "bg-white/[0.04] text-white ring-white/10 active:bg-white/10"}`}
                    >
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 space-y-3 border-t border-white/10 pt-5 text-sm text-white/70">
              <Link href="/gallery" className="block">View gallery →</Link>
              <Link href="/members" className="block">Members app →</Link>
              <p className="pt-2 text-xs opacity-70">{email}</p>
              <form action={signOut}><button className="underline underline-offset-4">Sign out</button></form>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
