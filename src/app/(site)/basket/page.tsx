import type { Metadata } from "next";
import { BasketView } from "@/components/shop/BasketView";

export const metadata: Metadata = { title: "Basket" };

export default function BasketPage() {
  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <h1 className="mb-10 font-serif text-5xl font-light">Basket</h1>
      <BasketView />
    </div>
  );
}
