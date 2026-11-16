import type { Metadata } from "next";
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
      <h1 className="animate-rise mb-12 font-serif text-5xl font-light md:text-7xl">Shop</h1>
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
