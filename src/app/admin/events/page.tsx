import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";
import { Notice, PageHead } from "@/components/admin/ui";

export default async function EventsAdmin({ searchParams }: PageProps<"/admin/events">) {
  const supabase = await serverClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, starts_at, location, members_only, capacity, event_rsvps(status, guests)")
    .order("starts_at", { ascending: false });

  return (
    <>
      <PageHead title="Events" action={{ href: "/admin/events/new", label: "+ New event" }}>
        Launches and private views. Members RSVP in the app.
      </PageHead>
      <Notice searchParams={await searchParams} />
      <ul className="space-y-3">
        {(events ?? []).map((e) => {
          const going = (e.event_rsvps ?? []).filter((r) => r.status === "going");
          const heads = going.reduce((n, r) => n + 1 + (r.guests ?? 0), 0);
          return (
            <li key={e.id}>
              <Link href={`/admin/events/${e.id}`} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
                <span>
                  <span className="block font-serif text-xl">{e.title}</span>
                  <span className="text-sm opacity-60">{formatUk(e.starts_at)} · {e.location ?? "Location TBC"}{e.members_only ? " · Members only" : ""}</span>
                </span>
                <span className="text-right text-sm">
                  <span className="block font-serif text-2xl">{heads}</span>
                  <span className="opacity-60">attending{e.capacity ? ` of ${e.capacity}` : ""}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
