import type { Metadata } from "next";
import { BasketView } from "@/components/shop/BasketView";
import { AppPageHead } from "@/components/members/AppPageHead";

export const metadata: Metadata = { title: "Basket" };

export default function MembersBasket() {
  return (
    <div className="pt-4">
      <AppPageHead className="mb-10!">Basket</AppPageHead>
      <BasketView base="/members" tone="dark" />
    </div>
  );
}
