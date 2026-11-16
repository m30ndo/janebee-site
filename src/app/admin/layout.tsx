import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";

export const metadata: Metadata = { title: "Admin" };

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/paintings", label: "Paintings" },
  { href: "/admin/shop", label: "Prints & shop" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/music", label: "Music" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/hive", label: "The Hive" },
];

async function Gate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh bg-cream text-espresso md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-espresso/10 bg-espresso px-5 py-5 text-cream md:min-h-dvh md:border-r md:border-b-0">
        <Link href="/admin" className="font-serif text-2xl font-light">Jane Bee</Link>
        <p className="text-xs tracking-[0.2em] uppercase opacity-60">Studio admin</p>
        <nav className="mt-6 flex gap-4 overflow-x-auto text-sm md:flex-col md:gap-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg py-1.5 whitespace-nowrap opacity-80 hover:opacity-100 md:px-3 md:hover:bg-cream/10">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 hidden space-y-2 text-xs opacity-70 md:block">
          <Link href="/gallery" className="block hover:opacity-100">View gallery →</Link>
          <Link href="/members" className="block hover:opacity-100">Members app →</Link>
          <p className="pt-4">{admin.email}</p>
          <form action={signOut}><button className="underline underline-offset-4">Sign out</button></form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-cream text-espresso">Loading studio…</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
