import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";
import { AdminMobileBar, AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Admin" };

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/paintings", label: "Paintings" },
  { href: "/admin/shop", label: "Prints & shop" },
  { href: "/admin/shop-carousel", label: "Carousel" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/diary", label: "Diary" },
  { href: "/admin/about", label: "About page" },
  { href: "/admin/friends", label: "Friends" },
  { href: "/admin/logo", label: "Logo" },
  { href: "/admin/backgrounds", label: "Backgrounds" },
  { href: "/admin/music", label: "Music" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/hive", label: "The Hive" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/legal", label: "Legal pages" },
];
const superNav = [{ href: "/admin/settings", label: "Settings" }];

async function Gate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const items = admin.superAdmin ? [...nav, ...superNav] : nav;
  return (
    <div className="min-h-dvh bg-black text-white [color-scheme:dark] selection:bg-honey selection:text-black md:grid md:grid-cols-[220px_1fr]">
      <Suspense fallback={null}><AdminMobileBar items={items} email={admin.email} signOut={signOut} /></Suspense>
      <aside className="hidden bg-black px-5 py-6 text-white md:sticky md:top-0 md:block md:h-dvh md:overflow-y-auto md:border-r md:border-white/10">
        <Link href="/admin" aria-label="Studio overview" className="block w-fit">
          <img src="/logo" alt="" width={72} height={72} className="h-[72px] w-[72px]" />
        </Link>
        <p className="mt-2 text-xs tracking-[0.2em] text-honey uppercase">Studio admin</p>
        <Suspense fallback={null}><AdminNav items={items} /></Suspense>
        <div className="mt-8 space-y-2 text-xs text-white/60">
          <Link href="/gallery" className="block hover:text-honey">View gallery →</Link>
          <Link href="/members" className="block hover:text-honey">Members app →</Link>
          <p className="pt-4">{admin.email}</p>
          <form action={signOut}><button className="underline underline-offset-4 hover:text-honey">Sign out</button></form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-black text-white/60">Loading studio…</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
