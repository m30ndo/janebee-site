import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { Suspense } from "react";
import { getShopForViewer } from "@/lib/data";
import { ShopView } from "@/components/views/ShopView";
import { ShopCarousel } from "@/components/shop/ShopCarousel";

export const metadata: Metadata = { title: "Shop" };

async function ShopContent() {
  const { originals, products } = await getShopForViewer();
  return (
    <>
      {/* full width: the carousel runs edge to edge */}
      <ShopCarousel originals={originals} products={products} className="-mx-6 mb-14 md:-mx-12 md:mb-20" />
      <ShopView originals={originals} products={products} />
    </>
  );
}

/**
 * The shop: a compact header (title one side, a line about it the other),
 * the 3D carousel of featured work, then the filter bar and an even grid.
 */
export default function ShopPage() {
  return (
    <div className="px-6 py-10 md:px-12 md:py-14">
      <PageBackground page="shop" />
      <header className="mb-10 flex flex-col gap-4 border-b border-white/15 pb-8 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-10">
        <h1 className="animate-rise font-title text-[16vw] leading-[0.9] font-light tracking-tight md:text-7xl md:whitespace-nowrap lg:text-8xl">
          The <span className="text-honey italic">Shop.</span>
        </h1>
        <p className="animate-rise max-w-sm text-sm leading-relaxed opacity-75 md:pb-2 md:text-right" style={{ animationDelay: "0.15s" }}>
          Originals that only exist once, and prints for walls that want a bit of trouble. Packed by hand in the studio.
        </p>
      </header>
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
