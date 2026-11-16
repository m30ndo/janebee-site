import type { Metadata } from "next";
import { getShopForViewer } from "@/lib/data";
import { ShopView } from "@/components/views/ShopView";
import { BasketLink } from "@/components/shop/AddToBasket";

export const metadata: Metadata = { title: "Shop" };

export default async function MembersShop() {
  const { originals, products } = await getShopForViewer();
  return (
    <div className="pt-4">
      <div className="mb-10 flex items-end justify-between">
        <h1 className="animate-rise font-serif text-5xl font-light">Shop</h1>
        <span className="text-sm tracking-[0.15em] uppercase"><BasketLink base="/members" /></span>
      </div>
      <ShopView originals={originals} products={products} base="/members" tone="dark" />
    </div>
  );
}
