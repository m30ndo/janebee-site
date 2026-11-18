import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatDateRange, formatUk } from "@/lib/dates";
import { formatPrice } from "@/lib/painting";
import { Reveal } from "@/components/Reveal";
import { BeeFlyBy } from "@/components/members/BeeFlyBy";

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }).format(new Date()));
  return h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
};

export default async function MembersHome() {
  const viewer = await getViewer();
  const supabase = await serverClient();
  const now = new Date().toISOString();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
  const [{ data: prints }, { data: events }, { data: shows }] = await Promise.all([
    supabase.from("products").select("id, slug, name, image_path, public_from, product_variants(price_pence)").eq("active", true).order("members_from", { ascending: false }).limit(6),
    supabase.from("events").select("id, title, starts_at, location").gte("starts_at", now).order("starts_at").limit(1),
    supabase.from("diary").select("id, title, venue, starts_on, ends_on").or(`ends_on.gte.${today},and(ends_on.is.null,starts_on.gte.${today})`).order("starts_on").limit(1),
  ]);
  const next = events?.[0];
  const show = shows?.[0];

  return (
    <div className="space-y-24 pt-14 pb-8 md:space-y-32 md:pt-24">
      {/* hero */}
      <section className="stagger">
        <p className="text-xs tracking-[0.25em] uppercase opacity-60">{greeting()}{viewer?.firstName ? `, ${viewer.firstName}` : ""}</p>
        <h1 className="mt-5 font-serif text-[13vw] leading-[0.95] font-light md:text-8xl">
          First look,<br /><span className="italic text-honey">before anyone.</span>
        </h1>
        <p className="mt-8 max-w-md leading-relaxed opacity-75">New paintings, prints and invitations land here first. The public sees them later.</p>
        <Link href="/members/gallery" className="btn-glass mt-10 inline-block bg-honey px-8 py-4 font-medium text-espresso">
          Walk the gallery →
        </Link>
      </section>

      {next && (
        <Reveal>
          <Link href="/members/events" className="group relative block overflow-hidden bg-honey p-7 text-espresso md:p-10">
            <p className="relative text-xs tracking-[0.25em] uppercase opacity-70">You&apos;re invited</p>
            <p className="relative mt-3 font-serif text-4xl leading-tight">{next.title}</p>
            <p className="relative mt-2 text-sm">{formatUk(next.starts_at)}{next.location ? ` · ${next.location}` : ""}</p>
            <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm text-cream transition-transform group-hover:translate-x-1">RSVP →</span>
          </Link>
        </Reveal>
      )}

      {show && (
        <Reveal>
          <Link href="/members/diary" className="group block border-t border-cream/15 pt-8">
            <p className="text-xs tracking-[0.25em] text-honey uppercase">Next in the diary</p>
            <p className="mt-3 font-serif text-3xl leading-tight transition-colors group-hover:text-honey">{show.title}</p>
            <p className="mt-2 text-sm opacity-70">{formatDateRange(show.starts_on, show.ends_on)}{show.venue ? ` · ${show.venue}` : ""}</p>
            <span className="link-draw mt-5 inline-block text-xs tracking-[0.2em] uppercase">See the diary →</span>
          </Link>
        </Reveal>
      )}

      {/* prints */}
      {(prints ?? []).length > 0 && (
        <section>
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
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
                      {membersFirst && <span className="absolute top-3 left-3 rounded-full bg-grey px-2.5 py-1 text-[10px] text-cream">Hive first</span>}
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
      <BeeFlyBy />
    </div>
  );
}
