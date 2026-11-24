import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { FRIEND_KINDS, normaliseFriends, type Friend } from "@/lib/friends";
import { Field, Notice, PageHead, inputCls } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteFriend, moveFriend, saveFriend } from "./actions";

function FriendForm({ f, first, last }: { f?: Friend; first?: boolean; last?: boolean }) {
  return (
    <form action={saveFriend} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <input type="hidden" name="id" value={f?.id ?? ""} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name">
          <input name="name" defaultValue={f?.name} required className={inputCls} placeholder="e.g. The Little Gallery, Brighton" />
        </Field>
        <Field label="Section">
          <select name="kind" defaultValue={f?.kind ?? "friend"} className={inputCls}>
            {FRIEND_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </Field>
        <Field label="One line about them" hint="Shown under their name. Keep it short." wide>
          <input name="blurb" defaultValue={f?.blurb} maxLength={240} className={inputCls} placeholder="Shows Jane's originals all year round" />
        </Field>
        <Field label="Website" hint="Opens in a new tab.">
          <input name="url" defaultValue={f?.url} className={inputCls} placeholder="example.co.uk" />
        </Field>
        <Field label="Instagram" hint="Handle only, used if there's no website.">
          <input name="instagram" defaultValue={f?.instagram} className={inputCls} placeholder="@handle" />
        </Field>
        <div className="md:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-white/90">Photo or logo</span>
          <ImageUpload folder="friends" initialPath={f?.image_path} initialUrl={f?.image_path ? imageUrl(f.image_path) : null} hint="A square-ish photo or logo works best. Animated GIFs keep moving; PNG logos keep their see-through background." logo />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
        <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">{f ? "Save" : "Add to the list"}</button>
        {f && (
          <span className="flex items-center gap-4 text-sm">
            <button formAction={moveFriend} name="dir" value="up" disabled={first} formNoValidate className="text-white/70 hover:text-honey disabled:opacity-30">↑ Up</button>
            <button formAction={moveFriend} name="dir" value="down" disabled={last} formNoValidate className="text-white/70 hover:text-honey disabled:opacity-30">↓ Down</button>
            <DeleteButton action={deleteFriend} what={f.name} />
          </span>
        )}
      </div>
    </form>
  );
}

export default async function FriendsAdmin({ searchParams }: PageProps<"/admin/friends">) {
  const supabase = await serverClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "friends").maybeSingle();
  const friends = normaliseFriends(data?.value);
  return (
    <>
      <PageHead title="Friends of the Hive">
        Brand ambassadors, galleries and friends&apos; sites. Members see them in the app (home page and You → Friends of the Hive).
      </PageHead>
      <Notice searchParams={await searchParams} />
      <h2 className="mb-3 text-xs font-medium tracking-[0.18em] text-honey uppercase">Add someone</h2>
      <FriendForm />
      {friends.length > 0 && <h2 className="mt-10 mb-3 text-xs font-medium tracking-[0.18em] text-honey uppercase">On the list ({friends.length})</h2>}
      <div className="space-y-4">
        {friends.map((f, i) => <FriendForm key={f.id} f={f} first={i === 0} last={i === friends.length - 1} />)}
      </div>
    </>
  );
}
