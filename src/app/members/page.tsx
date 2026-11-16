import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatUk } from "@/lib/dates";
import { formatPrice, paintingNumber } from "@/lib/painting";

export default async function MembersHome() {
  const supabase = await serverClient();
  const now = new Date().toISOString();
  const [{ data: early }, { data: prints }, { data: events }] = await Promise.all([
    // works members can see that the public can't yet
    supabase
      .from("paintings")
      .select("id, slug, title, number, glimpse, status, price_pence, image_path, public_from, collections(slug, name)")
      .lte("members_from", now)
      .or(`public_from.is.null,public_from.gt."${now}"`)
      .order("members_from", { ascending: false })
      .limit(12),
    supabase
      .from("products")
      .select("id, slug, name, image_path, public_from, product_variants(price_pence)")
      .eq("active", true)
      .order("members_from", { ascending: false })
      .limit(6),
    supabase.from("events").select("id, title, starts_at, location").gte("starts_at", now).order("starts_at").limit(1),
  ]);
  const next = events?.[0];

  return (
    <div className="space-y-12 pt-4">
      <section>
        <p className="inline-block -rotate-2 font-punk text-4xl text-pink">First look</p>
        <h1 className="mt-3 font-serif text-4xl font-light">Before anyone else.</h1>
        <p className="mt-2 opacity-75">New work reaches the Hive first. Buy it before it goes public.</p>
      </section>

      {next && (
        <Link href="/members/events" className="block rounded-2xl bg-honey p-5 text-espresso">
          <p className="text-xs tracking-[0.2em] uppercase opacity-70">You&apos;re invited</p>
          <p className="mt-1 font-serif text-2xl">{next.title}</p>
          <p className="text-sm">{formatUk(next.starts_at)}{next.location ? ` · ${next.location}` : ""} · RSVP →</p>
        </Link>
      )}

      <section>
        <h2 className="mb-4 flex items-baseline justify-between font-serif text-2xl">
          Early access <span className="text-sm opacity-60">{early?.length ?? 0} works</span>
        </h2>
        {(early ?? []).length === 0 ? (
          <p className="rounded-2xl border border-cream/15 p-6 text-sm opacity-70">Nothing under wraps right now. You&apos;ll be the first to know.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4">
            {(early ?? []).map((w) => {
              const room = w.collections as unknown as { slug: string; name: string } | null;
              return (
                <li key={w.id}>
                  <Link href={`/gallery?room=${room?.slug ?? ""}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-cream/5">
                      {w.image_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl(w.image_path)!} alt={w.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                    </div>
                    <p className="mt-2 text-xs opacity-60">{paintingNumber(w.number)}{w.public_from ? ` · public ${formatUk(w.public_from, false)}` : ""}</p>
                    <p className="font-serif text-lg leading-tight">{w.title}</p>
                    <p className="text-sm opacity-75">{w.status === "available" && w.price_pence ? formatPrice(w.price_pence) : w.status === "sold" ? "Sold" : "Enquire"}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/gallery" className="mt-6 inline-block rounded-full border border-cream/40 px-5 py-2.5 text-sm hover:bg-cream hover:text-espresso">
          Walk the gallery →
        </Link>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl">Prints</h2>
        {(prints ?? []).length === 0 ? (
          <p className="text-sm opacity-70">No prints yet.</p>
        ) : (
          <ul className="space-y-3">
            {(prints ?? []).map((p) => {
              const prices = (p.product_variants ?? []).map((v) => v.price_pence);
              const isEarly = !p.public_from || p.public_from > now;
              return (
                <li key={p.id}>
                  <Link href={`/shop/${p.slug}`} className="flex items-center gap-4 rounded-2xl bg-cream/5 p-3 hover:bg-cream/10">
                    {p.image_path && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl(p.image_path)!} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    )}
                    <span className="flex-1">
                      <span className="block">{p.name}</span>
                      <span className="text-sm opacity-70">
                        {prices.length ? `from ${formatPrice(Math.min(...prices))}` : ""}
                        {isEarly && <span className="ml-2 rounded-full bg-pink px-2 py-0.5 text-xs text-cream">Members first</span>}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
