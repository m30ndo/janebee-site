import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { fromPence, toLocalInput } from "@/lib/dates";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, Notice, PageHead, ReleaseFields, SaveBar, Section, inputCls } from "@/components/admin/ui";

export default async function ProductEdit({ params, searchParams }: PageProps<"/admin/shop/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const supabase = await serverClient();
  const [{ data: p }, { data: paintings }] = await Promise.all([
    isNew
      ? Promise.resolve({ data: null })
      : supabase.from("products").select("*, product_variants(name, price_pence, stock, sort_order)").eq("id", id).maybeSingle(),
    supabase.from("paintings").select("id, title").order("title"),
  ]);
  if (!isNew && !p) notFound();

  const variants = ((p?.product_variants ?? []) as { name: string; price_pence: number; stock: number | null; sort_order: number }[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => [v.name, fromPence(v.price_pence), v.stock ?? ""].filter((x) => x !== "").join(" | "))
    .join("\n");

  return (
    <>
      <PageHead title={isNew ? "New product" : p!.name}>
        <Link href="/admin/shop" className="underline underline-offset-4">← All products</Link>
      </PageHead>
      <Notice searchParams={await searchParams} />
      <form action={saveProduct}>
        <input type="hidden" name="id" value={p?.id ?? ""} />
        <Section title="Photo">
          <ImageUpload folder="products" initialPath={p?.image_path} initialUrl={imageUrl(p?.image_path)} />
        </Section>
        <Section title="Product">
          <Field label="Name">
            <input name="name" required defaultValue={p?.name ?? ""} placeholder="Espresso, Served — giclée print" className={inputCls} />
          </Field>
          <Field label="Type">
            <select name="kind" defaultValue={p?.kind ?? "print"} className={inputCls}>
              <option value="print">Print</option>
              <option value="card">Cards</option>
              <option value="merch">Merch</option>
            </select>
          </Field>
          <Field label="Description" wide>
            <textarea name="description" rows={3} defaultValue={p?.description ?? ""} className={inputCls} />
          </Field>
          <Field label="Print of (optional)">
            <select name="painting_id" defaultValue={p?.painting_id ?? ""} className={inputCls}>
              <option value="">—</option>
              {(paintings ?? []).map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>
          </Field>
          <Field label="Web address" hint="Leave empty to make one from the name.">
            <input name="slug" defaultValue={p?.slug ?? ""} className={inputCls} />
          </Field>
          <Field label="Options, prices & stock" hint="One per line: name | price £ | stock (stock optional). e.g. A3 | 65 | 20" wide>
            <textarea name="variants" rows={4} required defaultValue={variants || "A4 | 45\nA3 | 65"} className={`${inputCls} font-mono text-sm`} />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="h-4 w-4 accent-honey" />
            On sale
          </label>
        </Section>
        <ReleaseFields publicFrom={toLocalInput(p?.public_from)} membersFrom={toLocalInput(p?.members_from)} />
        <SaveBar deleteAction={isNew ? undefined : deleteProduct} id={p?.id} what={`"${p?.name ?? "this product"}"`} />
      </form>
    </>
  );
}
