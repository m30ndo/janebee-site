import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { toLocalInput } from "@/lib/dates";
import { deleteDiary, saveDiary } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, Notice, PageHead, ReleaseFields, SaveBar, Section, inputCls } from "@/components/admin/ui";

export default async function DiaryEdit({ params, searchParams }: PageProps<"/admin/diary/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const supabase = await serverClient();
  const { data: d } = isNew ? { data: null } : await supabase.from("diary").select("*").eq("id", id).maybeSingle();
  if (!isNew && !d) notFound();

  return (
    <>
      <PageHead title={isNew ? "New diary date" : d!.title}>
        <Link href="/admin/diary" className="underline underline-offset-4">← Diary</Link>
      </PageHead>
      <Notice searchParams={await searchParams} />
      <form action={saveDiary}>
        <input type="hidden" name="id" value={d?.id ?? ""} />
        <Section title="Showing">
          <Field label="Title" hint="e.g. “Slightly Naughty” at The Rook Gallery">
            <input name="title" required defaultValue={d?.title ?? ""} className={inputCls} />
          </Field>
          <Field label="Venue">
            <input name="venue" defaultValue={d?.venue ?? ""} className={inputCls} />
          </Field>
          <Field label="First day">
            <input name="starts_on" type="date" required defaultValue={d?.starts_on ?? ""} className={inputCls} />
          </Field>
          <Field label="Last day" hint="Leave empty for a one-day event.">
            <input name="ends_on" type="date" defaultValue={d?.ends_on ?? ""} className={inputCls} />
          </Field>
          <Field label="Opening times" hint="e.g. Tue–Sat 10am–5pm, Sun 11am–4pm">
            <textarea name="opening_times" rows={2} defaultValue={d?.opening_times ?? ""} className={inputCls} />
          </Field>
          <Field label="Private view / opening night (UK)" hint="Optional.">
            <input name="opening_at" type="datetime-local" defaultValue={toLocalInput(d?.opening_at)} className={inputCls} />
          </Field>
          <Field label="Address" wide>
            <input name="address" defaultValue={d?.address ?? ""} className={inputCls} />
          </Field>
          <Field label="Venue website" wide>
            <input name="link" defaultValue={d?.link ?? ""} placeholder="https://" className={inputCls} />
          </Field>
          <Field label="About it" hint="Which paintings are showing, who else is in it." wide>
            <textarea name="description" rows={5} defaultValue={d?.description ?? ""} className={inputCls} />
          </Field>
          <ImageUpload folder="diary" initialPath={d?.image_path} initialUrl={imageUrl(d?.image_path)} />
        </Section>
        <ReleaseFields publicFrom={toLocalInput(d?.public_from)} membersFrom={toLocalInput(d?.members_from ?? (isNew ? new Date().toISOString() : null))} />
        <SaveBar deleteAction={isNew ? undefined : deleteDiary} id={d?.id} what="this diary date" />
      </form>
    </>
  );
}
