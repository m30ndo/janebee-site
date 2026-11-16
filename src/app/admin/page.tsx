import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";

export default async function AdminHome() {
  const supabase = await serverClient();
  const head = { count: "exact" as const, head: true };
  const [paintings, available, members, hive, paid, enquiries] = (
    await Promise.all([
      supabase.from("paintings").select("id", head),
      supabase.from("paintings").select("id", head).eq("status", "available"),
      supabase.from("profiles").select("id", head),
      supabase.from("hive_signups").select("id", head),
      supabase.from("orders").select("id", head).eq("status", "paid"),
      supabase.from("enquiries").select("id", head),
    ])
  ).map((r) => r.count ?? 0);
  const { data: latest } = await supabase.from("enquiries").select("id, name, kind, message, created_at").order("created_at", { ascending: false }).limit(5);

  const tiles = [
    { label: "Works", value: paintings, sub: `${available} available`, href: "/admin/paintings" },
    { label: "Orders to send", value: paid, sub: "paid, not yet dispatched", href: "/admin/orders" },
    { label: "Members", value: members, sub: "signed in to the app", href: "/admin/hive" },
    { label: "Hive list", value: hive, sub: "email sign-ups", href: "/admin/hive" },
    { label: "Enquiries", value: enquiries, sub: "all time", href: "/admin/enquiries" },
  ];

  return (
    <>
      <h1 className="mb-8 font-serif text-4xl font-light">Studio</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
            <p className="text-xs tracking-[0.15em] uppercase opacity-60">{t.label}</p>
            <p className="mt-2 font-serif text-4xl">{t.value}</p>
            <p className="mt-1 text-xs opacity-60">{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Link href="/admin/paintings/new" className="rounded-2xl bg-espresso p-6 text-cream hover:bg-honey hover:text-espresso">
          <p className="font-serif text-2xl">+ Add a painting</p>
          <p className="mt-1 text-sm opacity-80">Photo, story, price, room</p>
        </Link>
        <Link href="/admin/rooms/new" className="rounded-2xl border border-espresso/20 p-6 hover:bg-white">
          <p className="font-serif text-2xl">+ New room</p>
          <p className="mt-1 text-sm opacity-70">A collection in the gallery</p>
        </Link>
        <Link href="/admin/events/new" className="rounded-2xl border border-espresso/20 p-6 hover:bg-white">
          <p className="font-serif text-2xl">+ New event</p>
          <p className="mt-1 text-sm opacity-70">Launches & private views</p>
        </Link>
      </div>

      <h2 className="mt-12 mb-4 font-serif text-2xl">Latest enquiries</h2>
      <ul className="divide-y divide-espresso/10 rounded-2xl bg-white">
        {(latest ?? []).length === 0 && <li className="p-5 text-sm opacity-60">None yet.</li>}
        {(latest ?? []).map((e) => (
          <li key={e.id} className="p-5 text-sm">
            <p className="font-medium">{e.name} <span className="font-normal opacity-60">· {e.kind} · {formatUk(e.created_at)}</span></p>
            <p className="mt-1 line-clamp-2 opacity-80">{e.message}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
