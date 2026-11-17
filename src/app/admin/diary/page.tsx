import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { formatDateRange, releaseState } from "@/lib/dates";
import { Notice, PageHead, ReleaseBadge } from "@/components/admin/ui";

export default async function DiaryAdmin({ searchParams }: PageProps<"/admin/diary">) {
  const supabase = await serverClient();
  const { data: rows } = await supabase
    .from("diary")
    .select("id, title, venue, starts_on, ends_on, public_from, members_from")
    .order("starts_on", { ascending: false });

  return (
    <>
      <PageHead title="Diary" action={{ href: "/admin/diary/new", label: "+ New date" }}>
        Where Jane&apos;s paintings are showing. Members see it in the app&apos;s Diary, alongside Hive invitations from Events.
      </PageHead>
      <Notice searchParams={await searchParams} />
      <ul className="space-y-3">
        {(rows ?? []).map((r) => (
          <li key={r.id}>
            <Link href={`/admin/diary/${r.id}`} className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 hover:ring-honey/60">
              <span>
                <span className="block font-serif text-xl">{r.title}</span>
                <span className="text-sm opacity-60">{formatDateRange(r.starts_on, r.ends_on)} · {r.venue ?? "Venue TBC"}</span>
              </span>
              <ReleaseBadge state={releaseState(r.public_from, r.members_from)} />
            </Link>
          </li>
        ))}
        {(rows ?? []).length === 0 && <li className="rounded-2xl bg-white/[0.04] p-5 text-sm opacity-60 ring-1 ring-white/10">Nothing in the diary yet.</li>}
      </ul>
    </>
  );
}
