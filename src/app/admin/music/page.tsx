import { serverClient } from "@/lib/supabase/server";
import { addTrack, deleteTrack, moveTrack, updateTrack } from "@/app/admin/actions";
import { AudioUpload } from "@/components/admin/AudioUpload";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Notice, PageHead, inputCls } from "@/components/admin/ui";

const mmss = (s: number | null) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "");

export default async function MusicAdmin({ searchParams }: PageProps<"/admin/music">) {
  const supabase = await serverClient();
  const { data: tracks } = await supabase.from("tracks").select("*").order("sort_order").order("created_at");
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/music/`;

  return (
    <>
      <PageHead title="Music">
        The playlist for the gallery and the app&apos;s music player. Upload MP3 or AAC (under 50MB). Only use music you have the rights to play publicly.
      </PageHead>
      <Notice searchParams={await searchParams} />
      <AudioUpload action={addTrack} />

      <ol className="mt-8 space-y-3">
        {(tracks ?? []).length === 0 && <li className="rounded-2xl bg-white p-5 text-sm opacity-60">No tracks yet — the player stays hidden until you add one.</li>}
        {(tracks ?? []).map((t, i) => (
          <li key={t.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <form action={updateTrack} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={t.id} />
              <span className="w-6 text-center text-sm opacity-50">{i + 1}</span>
              <input name="title" defaultValue={t.title} className={`${inputCls} w-auto flex-1`} />
              <input name="artist" defaultValue={t.artist ?? ""} placeholder="Artist" className={`${inputCls} w-40`} />
              <span className="text-xs opacity-60">{mmss(t.duration_seconds)}</span>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={t.active} className="accent-honey" /> On
              </label>
              <button className="rounded-full bg-espresso px-4 py-2 text-sm text-cream hover:bg-honey hover:text-espresso">Save</button>
              <button formAction={moveTrack} name="dir" value="up" disabled={i === 0} className="rounded-lg px-2 py-1 hover:bg-espresso/10 disabled:opacity-20" aria-label="Move up">↑</button>
              <button formAction={moveTrack} name="dir" value="down" disabled={i === (tracks?.length ?? 0) - 1} className="rounded-lg px-2 py-1 hover:bg-espresso/10 disabled:opacity-20" aria-label="Move down">↓</button>
              <DeleteButton action={deleteTrack} what={`"${t.title}"`} />
            </form>
            <audio controls preload="none" src={base + t.file_path} className="mt-3 h-9 w-full" />
          </li>
        ))}
      </ol>
    </>
  );
}
