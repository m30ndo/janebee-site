import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { Suspense } from "react";
import { getShopForViewer } from "@/lib/data";
import { ShopView } from "@/components/views/ShopView";

export const metadata: Metadata = { title: "Shop" };

async function ShopContent() {
  const { originals, products } = await getShopForViewer();
  return <ShopView originals={originals} products={products} />;
}

export default function ShopPage() {
  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <PageBackground page="shop" />
      <header className="mb-10 grid gap-6 md:mb-12 md:grid-cols-[1fr_auto] md:items-end">
        <h1 className="animate-rise font-title text-[18vw] leading-[0.82] font-light tracking-tight md:text-[10rem]">
          The <span className="text-honey italic">Shop.</span>
        </h1>
        <p className="animate-rise max-w-xs text-sm leading-relaxed opacity-75 md:text-right" style={{ animationDelay: "0.15s" }}>
          Originals that only exist once, and prints for walls that want a bit of trouble. Packed by hand in the studio.
        </p>
      </header>
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
