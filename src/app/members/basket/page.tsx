import type { Metadata } from "next";
import { BasketView } from "@/components/shop/BasketView";

export const metadata: Metadata = { title: "Basket" };

export default function MembersBasket() {
  return (
    <div className="pt-4">
      <h1 className="animate-rise mb-10 font-h1 text-5xl font-light">Basket</h1>
      <BasketView base="/members" tone="dark" />
    </div>
  );
}
