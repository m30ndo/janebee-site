import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatUk } from "@/lib/dates";
import { formatPrice, paintingNumber } from "@/lib/painting";
import { Reveal } from "@/components/Reveal";

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }).format(new Date()));
  return h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
};

export default async function MembersHome() {
  const viewer = await getViewer();
  const supabase = await serverClient();
  const now = new Date().toISOString();
  const [{ data: early }, { data: prints }, { data: events }, { data: posts }] = await Promise.all([
    supabase
      .from("paintings")
      .select("id, slug, title, number, glimpse, status, price_pence, image_path, public_from")
      .lte("members_from", now)
      .or(`public_from.is.null,public_from.gt."${now}"`)
      .order("members_from", { ascending: false })
      .limit(12),
    supabase.from("products").select("id, slug, name, image_path, public_from, product_variants(price_pence)").eq("active", true).order("members_from", { ascending: false }).limit(6),
    supabase.from("events").select("id, title, starts_at, location").gte("starts_at", now).order("starts_at").limit(1),
    supabase.from("posts").select("slug, title, excerpt, cover_path, public_from").order("members_from", { ascending: false, nullsFirst: false }).limit(1),
  ]);
  const next = events?.[0];
  const post = posts?.[0];

  return (
    <div className="space-y-16 pt-2">
      {/* hero */}
      <section className="stagger">
        <p className="text-xs tracking-[0.25em] uppercase opacity-60">{greeting()}{viewer?.firstName ? `, ${viewer.firstName}` : ""}</p>
        <h1 className="mt-3 font-serif text-[13vw] leading-[0.92] font-light md:text-8xl">
          First look,<br /><span className="italic text-honey">before anyone.</span>
        </h1>
        <p className="mt-5 max-w-md opacity-75">New paintings, prints and invitations land here first. The public sees them later.</p>
      </section>

      {/* marquee */}
      <div className="-mx-5 overflow-hidden border-y border-cream/10 py-3 md:-mx-8" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 font-serif text-2xl italic whitespace-nowrap text-cream/70">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10 pr-10">
              <span>Every piece holds a memory</span><span className="text-pink">✦</span>
              <span>Come closer</span><span className="text-honey">✦</span>
              <span>The story&apos;s Bee-hind</span><span className="text-pink">✦</span>
              <span>Some will love it. Some will raise an eyebrow</span><span className="text-honey">✦</span>
            </span>
          ))}
        </div>
      </div>

      {next && (
        <Reveal>
          <Link href="/members/events" className="group relative block overflow-hidden rounded-3xl bg-honey p-6 text-espresso md:p-8">
            <span className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-pink/40 blur-2xl transition-transform duration-700 group-hover:scale-150" />
            <p className="relative text-xs tracking-[0.25em] uppercase opacity-70">You&apos;re invited</p>
            <p className="relative mt-2 font-serif text-4xl leading-tight">{next.title}</p>
            <p className="relative mt-1 text-sm">{formatUk(next.starts_at)}{next.location ? ` · ${next.location}` : ""}</p>
            <span className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm text-cream transition-transform group-hover:translate-x-1">RSVP →</span>
          </Link>
        </Reveal>
      )}

      {/* early access rail */}
      <section>
        <Reveal>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-serif text-3xl font-light">Early access</h2>
            <Link href="/members/gallery" className="link-draw text-xs tracking-[0.2em] uppercase">Walk the gallery →</Link>
          </div>
        </Reveal>
        {(early ?? []).length === 0 ? (
          <p className="rounded-2xl border border-cream/15 p-6 text-sm opacity-70">Nothing under wraps right now. You&apos;ll be the first to know.</p>
        ) : (
          <ul className="stagger -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:-mx-8 md:px-8">
            {(early ?? []).map((w) => (
              <li key={w.id} className="w-[68vw] shrink-0 snap-start md:w-72">
                <Link href={`/members/work/${w.slug}`} className="group block">
                  <div className="img-hover relative aspect-[4/5] rounded-2xl bg-cream/5">
                    {w.image_path && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl(w.image_path)!} alt={w.title} className="h-full w-full rounded-2xl object-cover" />
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-espresso/70 px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase backdrop-blur">
                      {w.public_from ? `Public ${formatUk(w.public_from, false)}` : "Hive only"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs opacity-60">{paintingNumber(w.number)}</p>
                  <p className="font-serif text-xl leading-tight transition-colors group-hover:text-honey">{w.title}</p>
                  {w.glimpse && <p className="text-sm italic opacity-70">{w.glimpse}</p>}
                  <p className="mt-1 text-sm">{w.status === "available" && w.price_pence ? formatPrice(w.price_pence) : w.status === "sold" ? "Sold" : "Enquire"}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {post && (
        <Reveal>
          <Link href={`/members/journal/${post.slug}`} className="group grid gap-5 md:grid-cols-2 md:items-center">
            <div className="img-hover aspect-[4/3] rounded-2xl bg-cream/5">
              {post.cover_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl(post.cover_path)!} alt="" className="h-full w-full rounded-2xl object-cover" />
              )}
            </div>
            <div>
              <p className="text-xs tracking-[0.25em] uppercase opacity-60">From the journal</p>
              <p className="mt-2 font-serif text-4xl leading-tight font-light transition-colors group-hover:text-honey">{post.title}</p>
              {post.excerpt && <p className="mt-2 opacity-75">{post.excerpt}</p>}
              <span className="link-draw mt-4 inline-block text-xs tracking-[0.2em] uppercase">Read →</span>
            </div>
          </Link>
        </Reveal>
      )}

      {/* prints */}
      {(prints ?? []).length > 0 && (
        <section>
          <Reveal>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-serif text-3xl font-light">Prints</h2>
              <Link href="/members/shop" className="link-draw text-xs tracking-[0.2em] uppercase">Shop →</Link>
            </div>
          </Reveal>
          <ul className="stagger grid grid-cols-2 gap-4 md:grid-cols-3">
            {(prints ?? []).map((p) => {
              const prices = (p.product_variants ?? []).map((v) => v.price_pence);
              const membersFirst = !p.public_from || p.public_from > now;
              return (
                <li key={p.id}>
                  <Link href={`/members/shop/${p.slug}`} className="group block">
                    <div className="img-hover relative aspect-square rounded-2xl bg-cream/5">
                      {p.image_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl(p.image_path)!} alt="" className="h-full w-full rounded-2xl object-cover" />
                      )}
                      {membersFirst && <span className="absolute top-3 left-3 rounded-full bg-pink px-2.5 py-1 text-[10px] text-cream">Hive first</span>}
                    </div>
                    <p className="mt-2 text-sm leading-tight transition-colors group-hover:text-honey">{p.name}</p>
                    {prices.length > 0 && <p className="text-sm opacity-70">from {formatPrice(Math.min(...prices))}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
