import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { releaseState } from "@/lib/dates";
import { formatPrice, paintingNumber, statusLabel, type PaintingStatus } from "@/lib/painting";
import { Notice, PageHead, ReleaseBadge } from "@/components/admin/ui";

export default async function PaintingsPage({ searchParams }: PageProps<"/admin/paintings">) {
  const supabase = await serverClient();
  const { data: works } = await supabase
    .from("paintings")
    .select("id, kind, title, number, status, price_pence, image_path, public_from, members_from, collections(name)")
    .order("number", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHead title="Paintings & photos" action={{ href: "/admin/paintings/new", label: "+ Add a painting" }}>
        {works?.length ?? 0} works. Click one to edit its photo, story, price or release. <Link href="/admin/paintings/new?kind=photo" className="text-honey underline underline-offset-4">+ Add a photo-shoot photo</Link>
      </PageHead>
      <Notice searchParams={await searchParams} />
      <div className="overflow-x-auto rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-[0.12em] text-honey uppercase">
            <tr>
              <th className="p-4"></th><th className="p-4">Work</th><th className="p-4">Room</th>
              <th className="p-4">Status</th><th className="p-4">Price</th><th className="p-4">Visible to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {(works ?? []).map((w) => (
              <tr key={w.id} className="hover:bg-white/[0.04]">
                <td className="p-3">
                  {w.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl(w.image_path)!} alt="" className="h-14 w-14 rounded object-cover" />
                  ) : <span className="block h-14 w-14 rounded bg-white/10" />}
                </td>
                <td className="p-4">
                  <Link href={`/admin/paintings/${w.id}`} className="font-medium hover:underline">{w.title}</Link>
                  <span className="block text-xs opacity-60">{w.kind === "photo" ? "Photo" : paintingNumber(w.number)}</span>
                </td>
                <td className="p-4">{(w.collections as unknown as { name: string } | null)?.name ?? <span className="opacity-50">No room</span>}</td>
                <td className="p-4">{w.kind === "photo" ? "Photo shoot" : statusLabel[w.status as PaintingStatus]}</td>
                <td className="p-4">{w.price_pence ? formatPrice(w.price_pence) : "—"}</td>
                <td className="p-4"><ReleaseBadge state={releaseState(w.public_from, w.members_from)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
