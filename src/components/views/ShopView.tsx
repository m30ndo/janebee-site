import Link from "next/link";
import { formatPrice, paintingNumber, type Painting } from "@/lib/painting";
import type { ShopProduct } from "@/lib/data";
import { Reveal } from "@/components/Reveal";
import { imgBg, type Tone } from "./tone";

export function ShopView({ originals, products, base = "", tone = "dark" }: { originals: Painting[]; products: ShopProduct[]; base?: string; tone?: Tone }) {
  return (
    <>
      <section className="mb-16">
        <Reveal>
          <h2 className="mb-6 flex items-baseline gap-3 font-serif text-3xl font-light">
            Originals <span className="font-punk text-xl text-pink">one of one</span>
          </h2>
        </Reveal>
        {originals.length === 0 ? (
          <p className="opacity-70">Every original has found a home. New work reaches the Hive first.</p>
        ) : (
          <ul className="stagger grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
            {originals.map((p) => (
              <li key={p.id}>
                <Link href={`${base}/work/${p.slug}`} className="group block">
                  <div className={`img-hover relative aspect-[4/5] ${imgBg(tone)}`}>
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-cream/90 py-2 text-center text-xs tracking-[0.18em] text-espresso uppercase opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      Come closer
                    </span>
                  </div>
                  <p className="mt-3 text-xs opacity-60">{paintingNumber(p.number)}</p>
                  <p className="font-serif text-xl leading-tight transition-colors group-hover:text-honey">{p.title}</p>
                  <p className="text-sm">{p.pricePence ? formatPrice(p.pricePence) : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <Reveal>
          <h2 className="mb-6 font-serif text-3xl font-light">Prints & more</h2>
        </Reveal>
        {products.length === 0 ? (
          <p className="opacity-70">Prints are coming soon.</p>
        ) : (
          <ul className="stagger grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
            {products.map((p) => {
              const from = Math.min(...p.variants.map((v) => v.price_pence));
              return (
                <li key={p.id}>
                  <Link href={`${base}/shop/${p.slug}`} className="group block">
                    <div className={`img-hover relative aspect-square ${imgBg(tone)}`}>
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      )}
                      {p.membersFirst && <span className="absolute top-3 left-3 rounded-full bg-pink px-2.5 py-1 text-xs text-cream">Hive first</span>}
                    </div>
                    <p className="mt-3 leading-tight transition-colors group-hover:text-honey">{p.name}</p>
                    {Number.isFinite(from) && <p className="text-sm opacity-70">from {formatPrice(from)}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
