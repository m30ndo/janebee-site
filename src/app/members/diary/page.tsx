import type { Metadata } from "next";
import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { dayParts, formatDateRange, formatUkTime, ukToday } from "@/lib/dates";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Diary" };

type Entry = {
  key: string;
  kind: "showing" | "invitation";
  title: string;
  start: string; // YYYY-MM-DD
  end: string | null;
  venue: string | null;
  address: string | null;
  times: string | null;
  openingAt: string | null;
  description: string | null;
  link: string | null;
  image: string | null;
};

const ukDate = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(iso));

/** Where Jane's paintings are showing, plus Hive invitations, laid out by month. */
export default async function MemberDiary({ searchParams }: PageProps<"/members/diary">) {
  const q = await searchParams;
  const past = q.when === "past";
  const today = ukToday();
  const supabase = await serverClient();

  const diaryQuery = supabase
    .from("diary")
    .select("id, title, venue, address, starts_on, ends_on, opening_times, opening_at, description, link, image_path");
  const eventsQuery = supabase.from("events").select("id, title, starts_at, location, description, image_path");

  const [{ data: shows }, { data: events }] = await Promise.all([
    past
      ? diaryQuery.lt("starts_on", today).order("starts_on", { ascending: false }).limit(40)
      : diaryQuery.or(`ends_on.gte.${today},and(ends_on.is.null,starts_on.gte.${today})`).order("starts_on"),
    past
      ? eventsQuery.lt("starts_at", `${today}T00:00:00Z`).order("starts_at", { ascending: false }).limit(20)
      : eventsQuery.gte("starts_at", `${today}T00:00:00Z`).order("starts_at"),
  ]);

  const entries: Entry[] = [
    ...(shows ?? []).map((s): Entry => ({
      key: `d-${s.id}`, kind: "showing", title: s.title, start: s.starts_on, end: s.ends_on, venue: s.venue, address: s.address,
      times: s.opening_times, openingAt: s.opening_at, description: s.description, link: s.link, image: s.image_path,
    })),
    ...(events ?? []).map((e): Entry => ({
      key: `e-${e.id}`, kind: "invitation", title: e.title, start: ukDate(e.starts_at), end: null, venue: e.location, address: null,
      times: formatUkTime(e.starts_at), openingAt: null, description: e.description, link: null, image: e.image_path,
    })),
  ]
    // past items whose run is still going belong in "Coming up"
    .filter((x) => !past || (x.end ?? x.start) < today)
    .sort((a, b) => (past ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start)));

  const months = new Map<string, Entry[]>();
  for (const e of entries) {
    const m = dayParts(e.start).monthYear;
    months.set(m, [...(months.get(m) ?? []), e]);
  }

  return (
    <div className="pt-4">
      <h1 className="font-serif text-4xl font-light">Diary</h1>
      <p className="mt-2 opacity-75">Where to see Jane&apos;s paintings in the flesh: exhibitions, open studios and Hive evenings.</p>

      <div className="mt-6 mb-10 inline-flex border border-cream/20 text-xs tracking-[0.18em] uppercase">
        <Link href="/members/diary" className={`px-4 py-2 transition-colors ${!past ? "bg-honey text-espresso" : "hover:text-honey"}`}>Coming up</Link>
        <Link href="/members/diary?when=past" className={`px-4 py-2 transition-colors ${past ? "bg-honey text-espresso" : "hover:text-honey"}`}>Past</Link>
      </div>

      {entries.length === 0 && (
        <p className="border border-cream/15 p-6 text-sm opacity-70">
          {past ? "Nothing in the archive yet." : "No dates in the diary just yet. New showings land here first."}
        </p>
      )}

      <div className="space-y-12">
        {[...months.entries()].map(([month, list]) => (
          <section key={month}>
            <Reveal>
              <h2 className="mb-5 flex items-center gap-4 text-xs tracking-[0.25em] text-honey uppercase">
                {month}
                <span className="h-px flex-1 bg-cream/15" />
              </h2>
            </Reveal>
            <ol className="stagger space-y-5">
              {list.map((e) => <DiaryCard key={e.key} entry={e} today={today} />)}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function DiaryCard({ entry: e, today }: { entry: Entry; today: string }) {
  const d = dayParts(e.start);
  const on = e.start <= today && (e.end ?? e.start) >= today;
  const maps = e.address || e.venue ? `https://maps.apple.com/?q=${encodeURIComponent([e.venue, e.address].filter(Boolean).join(", "))}` : null;

  return (
    <li className="grid grid-cols-[4.5rem_1fr] gap-4 md:grid-cols-[6rem_1fr] md:gap-6">
      {/* date block */}
      <div className={`flex h-[4.5rem] flex-col items-center justify-center border md:h-24 ${on ? "border-honey bg-honey text-espresso" : "border-cream/20"}`}>
        <span className="text-[10px] tracking-[0.2em] uppercase opacity-70">{d.weekday}</span>
        <span className="font-serif text-3xl leading-none md:text-4xl">{d.day}</span>
        <span className="text-[10px] tracking-[0.2em] uppercase">{d.month}</span>
      </div>

      <article className="overflow-hidden border border-cream/15 bg-cream/[0.03]">
        {e.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(e.image)!} alt="" className="h-40 w-full object-cover md:h-52" />
        )}
        <div className="p-4 md:p-5">
          <p className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.2em] uppercase">
            <span className={e.kind === "invitation" ? "text-grey" : "text-honey"}>{e.kind === "invitation" ? "Hive invitation" : "Showing"}</span>
            {on && <span className="bg-honey px-2 py-0.5 text-espresso">On now</span>}
          </p>
          <h3 className="mt-1 font-serif text-2xl leading-tight">{e.title}</h3>

          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="opacity-50">Dates</dt>
            <dd>{formatDateRange(e.start, e.end)}</dd>
            {e.times && (<><dt className="opacity-50">{e.kind === "invitation" ? "Time" : "Open"}</dt><dd className="whitespace-pre-line">{e.times}</dd></>)}
            {e.openingAt && (<><dt className="opacity-50">Private view</dt><dd>{formatDateRange(ukDate(e.openingAt))}, {formatUkTime(e.openingAt)}</dd></>)}
            {(e.venue || e.address) && (
              <>
                <dt className="opacity-50">Where</dt>
                <dd>
                  {e.venue && <span className="block">{e.venue}</span>}
                  {e.address && <span className="block opacity-70">{e.address}</span>}
                </dd>
              </>
            )}
          </dl>

          {e.description && <p className="mt-3 text-sm whitespace-pre-line opacity-80">{e.description}</p>}

          <div className="mt-4 flex flex-wrap gap-3">
            {e.kind === "invitation" && (
              <Link href="/members/events" className="rounded-full bg-honey px-5 py-2.5 text-sm font-medium text-espresso">RSVP</Link>
            )}
            {maps && (
              <a href={maps} target="_blank" rel="noreferrer" className="rounded-full border border-cream/30 px-5 py-2.5 text-sm">Directions</a>
            )}
            {e.link && (
              <a href={e.link} target="_blank" rel="noreferrer" className="rounded-full border border-cream/30 px-5 py-2.5 text-sm">Venue</a>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}
