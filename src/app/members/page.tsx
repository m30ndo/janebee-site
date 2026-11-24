import Link from "next/link";
import { connection } from "next/server";
import { getViewer } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatDateRange, formatUk } from "@/lib/dates";
import { formatPrice, paintingNumber } from "@/lib/painting";
import { getPostsForViewer, getRoomsForViewer } from "@/lib/data";
import { getFriends } from "@/lib/settings";
import { daySeed } from "@/lib/daily";
import { Reveal } from "@/components/Reveal";
import { BeeFlyBy } from "@/components/members/BeeFlyBy";
import { HomeHero, JokeCard, type Slide } from "@/components/members/HomeHero";
import { FriendCard } from "@/components/members/FriendCard";
import { PageBackground } from "@/components/PageBackground";

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">{children}</p>
);

export default async function MembersHome() {
  await connection(); // request-time: the dates below must not be prerendered
  const viewer = await getViewer();
  const supabase = await serverClient();
  const now = new Date().toISOString();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
  const [rooms, posts, friends, { data: prints }, { data: events }, { data: shows }] = await Promise.all([
    getRoomsForViewer().catch(() => []),
    getPostsForViewer().catch(() => []),
    getFriends().catch(() => []),
    supabase.from("products").select("id, slug, name, image_path, public_from, product_variants(price_pence)").eq("active", true).order("members_from", { ascending: false }).limit(8),
    supabase.from("events").select("id, title, starts_at, location").gte("starts_at", now).order("starts_at").limit(1),
    supabase.from("diary").select("id, title, venue, starts_on, ends_on").or(`ends_on.gte.${today},and(ends_on.is.null,starts_on.gte.${today})`).order("starts_on").limit(1),
  ]);
  const next = events?.[0];
  const show = shows?.[0];

  // every work with a picture, paintings first
  const works = rooms.flatMap((r) => r.paintings.map((p) => ({ p, room: r }))).filter((w) => w.p.image);
  const paintings = works.filter((w) => w.p.kind === "painting");
  const pool = paintings.length ? paintings : works;
  const slides: Slide[] = pool.slice(0, 10).map(({ p, room }) => ({
    image: p.image!, title: p.title, room: room.name, href: `/members/gallery?room=${room.slug}&work=${p.slug}`,
  }));
  // the same painting all day, a new one tomorrow
  const potd = pool.length ? pool[daySeed() % pool.length] : null;
  const latest = posts[0];

  return (
    <div className="space-y-20 pb-8 md:space-y-28">
      <PageBackground page="app-home" />
      <HomeHero firstName={viewer?.firstName ?? null} slides={slides} />

      {next && (
        <Reveal>
          <Link href="/members/events" className="group relative block overflow-hidden bg-honey p-7 text-black md:p-10">
            <span className="absolute -right-8 -bottom-10 font-title text-[10rem] leading-none opacity-15" aria-hidden>✶</span>
            <p className="relative text-xs tracking-[0.25em] uppercase opacity-70">You&apos;re invited</p>
            <p className="relative mt-3 font-h2 text-4xl leading-tight">{next.title}</p>
            <p className="relative mt-2 text-sm">{formatUk(next.starts_at)}{next.location ? ` · ${next.location}` : ""}</p>
            <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm text-white transition-transform group-hover:translate-x-1">RSVP →</span>
          </Link>
        </Reveal>
      )}

      {/* painting of the day */}
      {potd && (
        <Reveal>
          <section className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
            <Link href={`/members/work/${potd.p.slug}`} className="img-hover group relative block overflow-hidden bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={potd.p.image!} alt={potd.p.title} className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
              <span className="absolute top-4 left-4 bg-black px-3 py-1.5 text-[10px] font-semibold tracking-[0.25em] text-honey uppercase">Painting of the day</span>
            </Link>
            <div>
              <Kicker>{[paintingNumber(potd.p.number), potd.room.name].filter(Boolean).join(" · ")}</Kicker>
              <h2 className="mt-3 font-h1 text-5xl leading-[0.95] font-light md:text-6xl">{potd.p.title}</h2>
              {potd.p.glimpse && <p className="mt-4 font-h2 text-xl italic opacity-80">“{potd.p.glimpse}”</p>}
              <p className="mt-4 text-sm opacity-60">{[potd.p.medium, potd.p.widthCm && potd.p.heightCm ? `${potd.p.widthCm} × ${potd.p.heightCm} cm` : null].filter(Boolean).join(" · ")}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/members/work/${potd.p.slug}`} className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-honey">The story Bee-hind →</Link>
                <Link href={`/members/gallery?room=${potd.room.slug}&work=${potd.p.slug}`} className="rounded-full border border-white/30 px-6 py-3 text-sm transition-colors hover:border-honey hover:text-honey">See it on the wall</Link>
              </div>
              <p className="mt-6 text-xs opacity-50">A new one tomorrow.</p>
            </div>
          </section>
        </Reveal>
      )}

      {/* joke of the visit */}
      <Reveal><JokeCard /></Reveal>

      {/* new in the shop */}
      {(prints ?? []).length > 0 && (
        <section>
          <Reveal>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-h2 text-4xl font-light">New in</h2>
              <Link href="/members/shop" className="link-draw text-xs tracking-[0.2em] uppercase">Shop →</Link>
            </div>
          </Reveal>
          <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            {(prints ?? []).map((p) => {
              const prices = (p.product_variants ?? []).map((v) => v.price_pence);
              const membersFirst = !p.public_from || p.public_from > now;
              return (
                <li key={p.id} className="w-[62vw] shrink-0 snap-start sm:w-[40vw] md:w-auto">
                  <Link href={`/members/shop/${p.slug}`} className="group block">
                    <div className="img-hover relative aspect-square rounded-2xl bg-white/5">
                      {p.image_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl(p.image_path)!} alt="" className="h-full w-full rounded-2xl object-cover" />
                      )}
                      {membersFirst && <span className="absolute top-3 left-3 rounded-full bg-pink px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] text-black uppercase">Hive first</span>}
                    </div>
                    <p className="mt-3 font-h2 text-lg leading-tight transition-colors group-hover:text-honey">{p.name}</p>
                    {prices.length > 0 && <p className="text-sm opacity-70">from {formatPrice(Math.min(...prices))}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* diary + journal side by side */}
      {(show || latest) && (
        <div className="grid gap-12 md:grid-cols-2">
          {show && (
            <Reveal>
              <Link href="/members/diary" className="group block border-t border-white/15 pt-8">
                <Kicker>Next in the diary</Kicker>
                <p className="mt-3 font-h2 text-3xl leading-tight transition-colors group-hover:text-honey">{show.title}</p>
                <p className="mt-2 text-sm opacity-70">{formatDateRange(show.starts_on, show.ends_on)}{show.venue ? ` · ${show.venue}` : ""}</p>
                <span className="link-draw mt-5 inline-block text-xs tracking-[0.2em] uppercase">See the diary →</span>
              </Link>
            </Reveal>
          )}
          {latest && (
            <Reveal delay={100}>
              <Link href={`/members/journal/${latest.slug}`} className="group block border-t border-white/15 pt-8">
                <Kicker>Fresh from the journal · {latest.category || "Studio notes"}</Kicker>
                <div className="mt-4 flex gap-4">
                  {latest.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={latest.cover} alt="" className="h-20 w-20 shrink-0 object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="font-h2 text-2xl leading-tight transition-colors group-hover:text-honey">{latest.title}</p>
                    {latest.excerpt && <p className="mt-2 line-clamp-2 text-sm opacity-70">{latest.excerpt}</p>}
                  </div>
                </div>
                <span className="link-draw mt-5 inline-block text-xs tracking-[0.2em] uppercase">Read it →</span>
              </Link>
            </Reveal>
          )}
        </div>
      )}

      {/* friends of the hive */}
      {friends.length > 0 && (
        <section>
          <Reveal>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <Kicker>Ambassadors · galleries · friends</Kicker>
                <h2 className="mt-2 font-h2 text-4xl font-light">Friends of the Hive</h2>
              </div>
              <Link href="/members/friends" className="link-draw text-xs tracking-[0.2em] uppercase">All →</Link>
            </div>
          </Reveal>
          <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            {friends.slice(0, 8).map((f) => <li key={f.id} className="w-[44vw] shrink-0 snap-start sm:w-[30vw] md:w-auto"><FriendCard f={f} compact /></li>)}
          </ul>
        </section>
      )}

      <Reveal>
        <p className="mx-auto max-w-sm text-center font-hand text-3xl leading-tight text-white/70">Something new lands here every week. Come back soon. <span className="text-honey">x</span></p>
      </Reveal>
      <BeeFlyBy />
    </div>
  );
}
