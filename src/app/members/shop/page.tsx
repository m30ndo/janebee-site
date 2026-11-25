import type { Metadata } from "next";
import { getShopForViewer } from "@/lib/data";
import { ShopView } from "@/components/views/ShopView";
import { BasketLink } from "@/components/shop/AddToBasket";
import { AppPageHead } from "@/components/members/AppPageHead";

export const metadata: Metadata = { title: "Shop" };

export default async function MembersShop() {
  const { originals, products } = await getShopForViewer();
  return (
    <div className="pt-4">
      <AppPageHead eyebrow="Members see it first" action={<BasketLink base="/members" />} className="mb-6!">
        The <span className="text-honey italic">Shop.</span>
      </AppPageHead>
      <ShopView originals={originals} products={products} base="/members" tone="dark" />
    </div>
  );
}
