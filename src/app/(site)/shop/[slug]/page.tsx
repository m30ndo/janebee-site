import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductForViewer } from "@/lib/data";
import { ProductView } from "@/components/views/ProductView";

export const metadata: Metadata = { title: "Shop" };

async function Product({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const p = await getProductForViewer((await params).slug);
  if (!p) notFound();
  return <ProductView p={p} />;
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
