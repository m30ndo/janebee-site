import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatUk, isoHoursAgo } from "@/lib/dates";
import { rsvp } from "@/app/members/actions";
import { AppPageHead } from "@/components/members/AppPageHead";

export const metadata: Metadata = { title: "Invitations" };

export default async function MemberEvents({ searchParams }: PageProps<"/members/events">) {
  const q = await searchParams;
  const viewer = await getViewer();
  const supabase = await serverClient();
  const now = isoHoursAgo(6); // keep tonight's event visible
  const [{ data: events }, { data: mine }] = await Promise.all([
    supabase.from("events").select("*").gte("starts_at", now).order("starts_at"),
    supabase.from("event_rsvps").select("event_id, status, guests").eq("member_id", viewer!.id),
  ]);
  const reply = new Map((mine ?? []).map((r) => [r.event_id, r]));

  return (
    <div className="pt-4">
      <AppPageHead intro="Launches, private views and studio evenings.">Invitations</AppPageHead>
      {q.replied && <p className="mb-6 rounded-xl bg-cream/10 px-4 py-3 text-sm">{q.replied === "going" ? "Lovely — you're on the list." : "Thanks for letting us know."}</p>}

      <ul className="space-y-6">
        {(events ?? []).length === 0 && <li className="rounded-2xl border border-cream/15 p-6 text-sm opacity-70">Nothing planned just yet. Invitations will appear here.</li>}
        {(events ?? []).map((e) => {
          const r = reply.get(e.id);
          return (
            <li key={e.id} className="overflow-hidden rounded-2xl bg-cream text-espresso">
              {e.image_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl(e.image_path)!} alt="" className="h-44 w-full object-cover" />
              )}
              <div className="p-5">
                <p className="text-xs tracking-[0.2em] uppercase opacity-60">{e.members_only ? "Members only" : "Open event"}</p>
                <h2 className="mt-1 font-serif text-3xl">{e.title}</h2>
                <p className="mt-1 text-sm">{formatUk(e.starts_at)}{e.location ? ` · ${e.location}` : ""}</p>
                {e.description && <p className="mt-3 text-sm whitespace-pre-line opacity-80">{e.description}</p>}

                <form action={rsvp} className="mt-5 flex flex-wrap items-center gap-3">
                  <input type="hidden" name="event_id" value={e.id} />
                  <label className="text-sm">
                    Guests{" "}
                    <select name="guests" defaultValue={r?.guests ?? 0} className="ml-1 rounded-lg border border-espresso/20 bg-white px-2 py-1.5">
                      {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n === 0 ? "Just me" : `+${n}`}</option>)}
                    </select>
                  </label>
                  <button name="status" value="going" className={`rounded-full px-5 py-2.5 text-sm font-medium ${r?.status === "going" ? "bg-honey" : "bg-espresso text-cream"}`}>
                    {r?.status === "going" ? "✓ Going" : "I'll be there"}
                  </button>
                  <button name="status" value="not_going" className={`text-sm underline underline-offset-4 ${r?.status === "not_going" ? "font-medium" : "opacity-70"}`}>
                    {r?.status === "not_going" ? "Can't make it ✓" : "Can't make it"}
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
