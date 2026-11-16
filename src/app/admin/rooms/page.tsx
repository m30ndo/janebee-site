import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { releaseState } from "@/lib/dates";
import { Notice, PageHead, ReleaseBadge } from "@/components/admin/ui";
import { floorStyles } from "@/lib/painting";

export default async function RoomsPage({ searchParams }: PageProps<"/admin/rooms">) {
  const supabase = await serverClient();
  const { data: rooms } = await supabase
    .from("collections")
    .select("id, name, slug, sort_order, wall_colour, floor_style, public_from, members_from, paintings(count)")
    .order("sort_order");

  return (
    <>
      <PageHead title="Rooms" action={{ href: "/admin/rooms/new", label: "+ New room" }}>
        Each room is a collection in the 3D gallery. Click a room to change its name, wall colour, floor and order — or change the floor live from the gallery (Floor button, top left).
      </PageHead>
      <Notice searchParams={await searchParams} />
      <ul className="space-y-3">
        {(rooms ?? []).map((r) => (
          <li key={r.id}>
            <Link href={`/admin/rooms/${r.id}`} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
              <span className="h-10 w-10 shrink-0 rounded-lg border border-espresso/10" style={{ background: r.wall_colour }} />
              <span className="flex-1">
                <span className="block font-serif text-xl">{r.name}</span>
                <span className="text-sm opacity-60">
                  Room {r.sort_order} · {(r.paintings as unknown as { count: number }[])[0]?.count ?? 0} works · Floor: {floorStyles.find((f) => f.value === r.floor_style)?.label ?? "Oak"}
                </span>
              </span>
              <ReleaseBadge state={releaseState(r.public_from, r.members_from)} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
