import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { LEGAL_DEFAULTS } from "@/lib/legal";
import { Field, Notice, PageHead, Section, inputCls } from "@/components/admin/ui";
import { saveLegal } from "../actions";

export default async function LegalEdit({ params, searchParams }: PageProps<"/admin/legal/[slug]">) {
  const { slug } = await params;
  const def = LEGAL_DEFAULTS.find((p) => p.slug === slug);
  if (!def) notFound();
  const supabase = await serverClient();
  const { data } = await supabase.from("legal_pages").select("title, body").eq("slug", slug).maybeSingle();
  return (
    <>
      <Link href="/admin/legal" className="text-sm text-white/60 hover:text-white">← Legal pages</Link>
      <PageHead title={data?.title ?? def.title}>
        Shows at <a href={`/legal/${slug}`} target="_blank" rel="noopener" className="text-honey underline underline-offset-4">/legal/{slug}</a>.
      </PageHead>
      <Notice searchParams={await searchParams} />
      <form action={saveLegal}>
        <input type="hidden" name="slug" value={slug} />
        <Section title="Page">
          <Field label="Title" wide><input name="title" defaultValue={data?.title ?? def.title} className={inputCls} /></Field>
          <Field label="Text" wide hint="Blank line = new paragraph · ## Heading · - bullet · **bold** · *italic* · [link](https://…)">
            <textarea name="body" rows={24} defaultValue={data?.body ?? def.body} className={`${inputCls} font-mono text-sm leading-relaxed`} />
          </Field>
        </Section>
        <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-4 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur">
          <button className="rounded-full bg-honey px-8 py-3 font-medium text-black hover:bg-white">Save</button>
          <button name="reset" value="1" className="text-sm text-white/60 underline underline-offset-4 hover:text-white">Reset to the original text</button>
        </div>
      </form>
    </>
  );
}
