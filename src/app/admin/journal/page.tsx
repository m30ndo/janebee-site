import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatUk, releaseState } from "@/lib/dates";
import { Notice, PageHead, ReleaseBadge } from "@/components/admin/ui";

export default async function JournalAdmin({ searchParams }: PageProps<"/admin/journal">) {
  const supabase = await serverClient();
  const { data: posts } = await supabase.from("posts").select("id, title, excerpt, cover_path, public_from, members_from, updated_at").order("created_at", { ascending: false });
  return (
    <>
      <PageHead title="Journal" action={{ href: "/admin/journal/new", label: "+ New post" }}>
        Stories from the studio. Shows in the app and on the website.
      </PageHead>
      <Notice searchParams={await searchParams} />
      <ul className="space-y-3">
        {(posts ?? []).map((p) => (
          <li key={p.id}>
            <Link href={`/admin/journal/${p.id}`} className="flex items-center gap-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 hover:ring-honey/60">
              {p.cover_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl(p.cover_path)!} alt="" className="h-16 w-20 rounded object-cover" />
              ) : <span className="h-16 w-20 rounded bg-white/10" />}
              <span className="flex-1">
                <span className="block font-serif text-xl">{p.title}</span>
                <span className="line-clamp-1 text-sm opacity-60">{p.excerpt ?? `Edited ${formatUk(p.updated_at, false)}`}</span>
              </span>
              <ReleaseBadge state={releaseState(p.public_from, p.members_from)} />
            </Link>
          </li>
        ))}
        {(posts ?? []).length === 0 && <li className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5 text-sm opacity-60">No posts yet.</li>}
      </ul>
    </>
  );
}
