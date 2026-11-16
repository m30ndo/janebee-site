import Link from "next/link";
import { ClearBasket } from "@/components/shop/ClearBasket";
import { outlineBtn, solidBtn, type Tone } from "./tone";

export function ThankYouView({ base = "", tone = "dark" }: { base?: string; tone?: Tone }) {
  return (
    <section className="stagger py-16 md:py-28">
      <ClearBasket />
      <p className="inline-block animate-float font-punk text-6xl text-pink">Thank you</p>
      <h1 className="mt-6 max-w-2xl font-serif text-5xl leading-tight font-light">It&apos;s on its way to you — story and all.</h1>
      <p className="mt-4 max-w-lg opacity-80">A receipt is in your inbox. Jane will let you know when it&apos;s dispatched.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/members/orders" className={`px-8 ${solidBtn(tone)}`}>Your orders</Link>
        <Link href={`${base}/gallery`} className={`px-8 ${outlineBtn(tone)}`}>Back to the gallery</Link>
      </div>
    </section>
  );
}
