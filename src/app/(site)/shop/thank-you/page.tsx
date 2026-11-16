import type { Metadata } from "next";
import Link from "next/link";
import { ClearBasket } from "@/components/shop/ClearBasket";

export const metadata: Metadata = { title: "Thank you" };

export default function ThankYou() {
  return (
    <section className="px-6 py-20 md:px-12 md:py-32">
      <ClearBasket />
      <p className="inline-block -rotate-3 font-punk text-5xl text-pink">Thank you</p>
      <h1 className="mt-6 max-w-2xl font-serif text-5xl leading-tight font-light">It&apos;s on its way to you — story and all.</h1>
      <p className="mt-4 max-w-lg opacity-80">A receipt is in your inbox. Jane will let you know when it&apos;s dispatched.</p>
      <div className="mt-10 flex gap-4">
        <Link href="/members/orders" className="rounded-full bg-espresso px-6 py-3 text-cream hover:bg-honey hover:text-espresso">Your orders</Link>
        <Link href="/gallery" className="rounded-full border border-espresso px-6 py-3 hover:bg-espresso hover:text-cream">Back to the gallery</Link>
      </div>
    </section>
  );
}
