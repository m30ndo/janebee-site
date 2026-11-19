import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { toLocalInput } from "@/lib/dates";
import { deletePost, savePost } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, Notice, PageHead, ReleaseFields, SaveBar, Section, inputCls } from "@/components/admin/ui";

export default async function PostEdit({ params, searchParams }: PageProps<"/admin/journal/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const supabase = await serverClient();
  const { data: p } = isNew ? { data: null } : await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!isNew && !p) notFound();

  return (
    <>
      <PageHead title={isNew ? "New post" : p!.title}>
        <Link href="/admin/journal" className="underline underline-offset-4">← All posts</Link>
        {!isNew && <> · <Link href={`/journal/${p!.slug}`} className="underline underline-offset-4">View post</Link></>}
      </PageHead>
      <Notice searchParams={await searchParams} />
      <form action={savePost}>
        <input type="hidden" name="id" value={p?.id ?? ""} />
        <Section title="Cover image">
          <ImageUpload folder="journal" initialPath={p?.cover_path} initialUrl={imageUrl(p?.cover_path)} />
        </Section>
        <Section title="Post">
          <Field label="Title" wide>
            <input name="title" required defaultValue={p?.title ?? ""} className={`${inputCls} font-serif text-xl`} />
          </Field>
          <Field label="Standfirst" hint="One or two lines shown on the journal list." wide>
            <input name="excerpt" defaultValue={p?.excerpt ?? ""} className={inputCls} />
          </Field>
          <Field
            label="Story"
            hint="Blank line = new paragraph · ## Heading · > Quote · **bold** · *italic* · [link](https://…) · ![caption](image link) on its own line"
            wide
          >
            <textarea name="body" rows={16} defaultValue={p?.body ?? ""} className={`${inputCls} leading-relaxed`} />
          </Field>
          <Field label="Section" hint="Shown as the tag on the journal. Pick one or type your own.">
            <input name="category" list="journal-sections" defaultValue={p?.category ?? ""} className={inputCls} />
            <datalist id="journal-sections">
              {["Studio notes", "Artists", "Paint & style", "Out in London", "The Hive"].map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <Field label="Web address" hint="Leave empty to make one from the title.">
            <input name="slug" defaultValue={p?.slug ?? ""} className={inputCls} />
          </Field>
        </Section>
        <ReleaseFields publicFrom={toLocalInput(p?.public_from)} membersFrom={toLocalInput(p?.members_from)} />
        <SaveBar deleteAction={isNew ? undefined : deletePost} id={p?.id} what={`"${p?.title ?? "this post"}"`} />
      </form>
    </>
  );
}
