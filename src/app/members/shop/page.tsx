import type { Metadata } from "next";
import { getShopForViewer } from "@/lib/data";
import { ShopView } from "@/components/views/ShopView";
import { BasketLink } from "@/components/shop/AddToBasket";

export const metadata: Metadata = { title: "Shop" };

export default async function MembersShop() {
  const { originals, products } = await getShopForViewer();
  return (
    <div className="pt-4">
      <header className="animate-rise mb-6 flex items-end justify-between border-b border-white/15 pb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">Members see it first</p>
          <h1 className="mt-2 font-title text-6xl leading-[0.85] font-light tracking-tight">The <span className="text-honey italic">Shop.</span></h1>
        </div>
        <span className="text-sm tracking-[0.15em] uppercase"><BasketLink base="/members" /></span>
      </header>
      <ShopView originals={originals} products={products} base="/members" tone="dark" />
    </div>
  );
}
