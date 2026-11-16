import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductForViewer } from "@/lib/data";
import { VariantPicker } from "@/components/shop/VariantPicker";

export const metadata: Metadata = { title: "Shop" };

async function Product({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const p = await getProductForViewer((await params).slug);
  if (!p) notFound();
  return (
    <article className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
      <div className="bg-[#efe9df] p-6 md:p-12">
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} className="mx-auto max-h-[75dvh] w-auto shadow-xl" />
        )}
      </div>
      <div>
        {p.membersFirst && <p className="mb-4 inline-block rounded-full bg-pink px-3 py-1 text-xs text-cream">Hive early access</p>}
        <h1 className="font-serif text-4xl font-light md:text-5xl">{p.name}</h1>
        {p.description && <p className="mt-4 leading-relaxed whitespace-pre-line opacity-85">{p.description}</p>}
        <div className="mt-8">
          <VariantPicker productName={p.name} image={p.image} variants={p.variants} />
        </div>
        <Link href="/shop" className="mt-8 block text-sm underline underline-offset-4 opacity-70">← Back to the shop</Link>
      </div>
    </article>
  );
}

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <Product params={params} />
      </Suspense>
    </div>
  );
}
