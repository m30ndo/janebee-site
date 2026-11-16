import { frameStyles } from "@/lib/painting";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { fromPence, toLocalInput } from "@/lib/dates";
import { deletePainting, savePainting } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, Notice, PageHead, ReleaseFields, SaveBar, Section, inputCls } from "@/components/admin/ui";

export default async function PaintingEdit({ params, searchParams }: PageProps<"/admin/paintings/[id]">) {
  const { id } = await params;
  const q = await searchParams;
  const isNew = id === "new";
  const supabase = await serverClient();
  const [{ data: p }, { data: rooms }, { data: last }] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : supabase.from("paintings").select("*").eq("id", id).maybeSingle(),
    supabase.from("collections").select("id, name").order("sort_order"),
    supabase.from("paintings").select("number").order("number", { ascending: false, nullsFirst: false }).limit(1),
  ]);
  if (!isNew && !p) notFound();
  const defaultRoom = typeof q.room === "string" ? q.room : "";
  const nextNumber = ((last?.[0]?.number as number | null) ?? 0) + 1;

  return (
    <>
      <PageHead title={isNew ? "Add a painting" : p!.title}>
        <Link href="/admin/paintings" className="underline underline-offset-4">← All paintings</Link>
        {!isNew && <> · <Link href={`/work/${p!.slug}`} className="underline underline-offset-4">View page</Link></>}
      </PageHead>
      <Notice searchParams={q} />

      <form action={savePainting}>
        <input type="hidden" name="id" value={p?.id ?? ""} />

        <Section title="Photo">
          <ImageUpload
            folder="paintings"
            initialPath={p?.image_path}
            initialUrl={imageUrl(p?.image_path)}
            initialWidth={p?.image_width}
            initialHeight={p?.image_height}
          />
        </Section>

        <Section title="The work">
          <Field label="Title">
            <input name="title" required defaultValue={p?.title ?? ""} className={inputCls} />
          </Field>
          <Field label="Number" hint="One-of-one numbering, shown as No. 007.">
            <input name="number" type="number" min={1} defaultValue={p?.number ?? nextNumber} className={inputCls} />
          </Field>
          <Field label="Glimpse" hint="One line hinting at the memory. Appears when visitors hover." wide>
            <input name="glimpse" maxLength={140} defaultValue={p?.glimpse ?? ""} className={inputCls} />
          </Field>
          <Field label="The story Bee-hind" hint="Jane's own words. Leave a blank line between paragraphs." wide>
            <textarea name="story" rows={7} defaultValue={p?.story ?? ""} className={inputCls} />
          </Field>
          <Field label="Medium">
            <input name="medium" placeholder="Oil on canvas" defaultValue={p?.medium ?? ""} className={inputCls} />
          </Field>
          <Field label="Year">
            <input name="year" type="number" defaultValue={p?.year ?? new Date().getFullYear()} className={inputCls} />
          </Field>
          <Field label="Width (cm)" hint="Real size — also sets how big it hangs in the gallery.">
            <input name="width_cm" type="number" step="0.1" defaultValue={p?.width_cm ?? ""} className={inputCls} />
          </Field>
          <Field label="Height (cm)">
            <input name="height_cm" type="number" step="0.1" defaultValue={p?.height_cm ?? ""} className={inputCls} />
          </Field>
        </Section>

        <Section title="Gallery & sale">
          <Field label="Room">
            <select name="collection_id" defaultValue={p?.collection_id ?? defaultRoom} className={inputCls}>
              <option value="">— Not hung yet —</option>
              {(rooms ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={p?.status ?? "available"} className={inputCls}>
              <option value="available">Available to buy</option>
              <option value="on_request">Price on request (enquire)</option>
              <option value="sold">Sold — the story stays</option>
              <option value="not_for_sale">Not for sale</option>
            </select>
          </Field>
          <Field label="Price (£)" hint="Needed when 'Available to buy'.">
            <input name="price" inputMode="decimal" placeholder="650" defaultValue={fromPence(p?.price_pence)} className={inputCls} />
          </Field>
          <Field label="Frame" hint="Leave on the room's frame unless this work needs something different.">
            <select name="frame_style" defaultValue={p?.frame_style ?? ""} className={inputCls}>
              <option value="">Same as the room</option>
              {frameStyles.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </Field>
          <Field label="Web address" hint="Leave empty to make one from the title.">
            <input name="slug" defaultValue={p?.slug ?? ""} className={inputCls} />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} className="h-4 w-4 accent-honey" />
            Feature on the home page
          </label>
        </Section>

        <ReleaseFields
          publicFrom={toLocalInput(p?.public_from ?? (isNew ? null : null))}
          membersFrom={toLocalInput(p?.members_from)}
        />
        <SaveBar deleteAction={isNew ? undefined : deletePainting} id={p?.id} what={`"${p?.title ?? "this work"}"`} />
      </form>
    </>
  );
}
