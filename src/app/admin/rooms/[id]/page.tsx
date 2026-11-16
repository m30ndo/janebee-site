import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { toLocalInput } from "@/lib/dates";
import { deleteRoom, movePainting, saveRoom } from "@/app/admin/actions";
import { Field, Notice, PageHead, ReleaseFields, SaveBar, Section, inputCls } from "@/components/admin/ui";

export default async function RoomEdit({ params, searchParams }: PageProps<"/admin/rooms/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const supabase = await serverClient();
  const { data: room } = isNew ? { data: null } : await supabase.from("collections").select("*").eq("id", id).maybeSingle();
  if (!isNew && !room) notFound();
  const { data: works } = isNew
    ? { data: [] }
    : await supabase.from("paintings").select("id, title, number, image_path, status").eq("collection_id", id).order("sort_order").order("created_at");
  const { count } = await supabase.from("collections").select("id", { count: "exact", head: true });

  return (
    <>
      <PageHead title={isNew ? "New room" : room!.name}>
        <Link href="/admin/rooms" className="underline underline-offset-4">← All rooms</Link>
        {!isNew && <> · <Link href={`/gallery?room=${room!.slug}`} className="underline underline-offset-4">Walk this room</Link></>}
      </PageHead>
      <Notice searchParams={await searchParams} />

      <form action={saveRoom}>
        <input type="hidden" name="id" value={room?.id ?? ""} />
        <Section title="Room">
          <Field label="Name" hint="Shown on the far wall and in the room list.">
            <input name="name" required defaultValue={room?.name ?? ""} className={inputCls} />
          </Field>
          <Field label="Order" hint="1 = the first room visitors enter.">
            <input name="sort_order" type="number" min={0} defaultValue={room?.sort_order ?? (count ?? 0) + 1} className={inputCls} />
          </Field>
          <Field label="Introduction" hint="One line under the room name." wide>
            <input name="intro" defaultValue={room?.intro ?? ""} className={inputCls} />
          </Field>
          <Field label="Wall colour">
            <input name="wall_colour" type="color" defaultValue={room?.wall_colour ?? "#efe9df"} className="h-11 w-24 rounded-lg border border-espresso/20" />
          </Field>
          <Field label="Web address" hint="Leave empty to make one from the name.">
            <input name="slug" defaultValue={room?.slug ?? ""} className={inputCls} />
          </Field>
        </Section>
        <ReleaseFields publicFrom={toLocalInput(room?.public_from)} membersFrom={toLocalInput(room?.members_from)} />
        <SaveBar deleteAction={isNew ? undefined : deleteRoom} id={room?.id} what="this room (its works stay, unassigned)" />
      </form>

      {!isNew && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-serif text-2xl">Hanging order</h2>
            <Link href={`/admin/paintings/new?room=${room!.id}`} className="text-sm underline underline-offset-4">+ Add a work to this room</Link>
          </div>
          <p className="mb-4 text-sm opacity-70">Works hang alternately on the left and right walls, front to back.</p>
          <ol className="space-y-2">
            {(works ?? []).map((w, i) => (
              <li key={w.id} className="flex items-center gap-4 rounded-xl bg-white p-3">
                <span className="w-6 text-center text-sm opacity-50">{i + 1}</span>
                {w.image_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl(w.image_path)!} alt="" className="h-12 w-12 rounded object-cover" />
                )}
                <Link href={`/admin/paintings/${w.id}`} className="flex-1 hover:underline">{w.title}</Link>
                <span className="text-xs opacity-60">{i % 2 === 0 ? "Left wall" : "Right wall"}</span>
                <form action={movePainting} className="flex gap-1">
                  <input type="hidden" name="id" value={w.id} />
                  <input type="hidden" name="room_id" value={room!.id} />
                  <button name="dir" value="up" disabled={i === 0} className="rounded-lg px-2 py-1 hover:bg-espresso/10 disabled:opacity-20" aria-label="Move earlier">↑</button>
                  <button name="dir" value="down" disabled={i === (works?.length ?? 0) - 1} className="rounded-lg px-2 py-1 hover:bg-espresso/10 disabled:opacity-20" aria-label="Move later">↓</button>
                </form>
              </li>
            ))}
            {(works ?? []).length === 0 && <li className="rounded-xl bg-white p-5 text-sm opacity-60">No works in this room yet.</li>}
          </ol>
        </section>
      )}
    </>
  );
}
