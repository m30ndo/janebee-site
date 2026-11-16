import Link from "next/link";
import type { ShopProduct } from "@/lib/data";
import { VariantPicker } from "@/components/shop/VariantPicker";
import { imgBg, type Tone } from "./tone";

export function ProductView({ p, base = "", tone = "dark" }: { p: ShopProduct; base?: string; tone?: Tone }) {
  return (
    <article className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
      <div className={`${imgBg(tone)} animate-fade grid place-items-center p-6 md:p-12`}>
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} className="max-h-[70dvh] w-auto shadow-2xl" />
        )}
      </div>
      <div className="stagger">
        {p.membersFirst && <p className="mb-4 inline-block rounded-full bg-pink px-3 py-1 text-xs text-cream">Hive early access</p>}
        <h1 className="font-serif text-4xl font-light md:text-5xl">{p.name}</h1>
        {p.description && <p className="mt-4 leading-relaxed whitespace-pre-line opacity-85">{p.description}</p>}
        <div className="mt-8">
          <VariantPicker productName={p.name} image={p.image} variants={p.variants} base={base} tone={tone} />
        </div>
        <Link href={`${base}/shop`} className="link-draw mt-8 inline-block text-sm opacity-70">← Back to the shop</Link>
      </div>
    </article>
  );
}
