import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { formatPrice, getShopForViewer, paintingNumber } from "@/lib/data";

export const metadata: Metadata = { title: "Shop" };

async function ShopContent() {
  const { originals, products } = await getShopForViewer();
  return (
    <>
      <section className="mb-16">
        <h2 className="mb-6 font-serif text-3xl font-light">Originals <span className="text-base opacity-60">one of one</span></h2>
        {originals.length === 0 ? (
          <p className="opacity-70">Every original has found a home. Join the Hive to hear about new work first.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {originals.map((p) => (
              <li key={p.id}>
                <Link href={`/work/${p.slug}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-[#efe9df]">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  <p className="mt-3 text-xs opacity-60">{paintingNumber(p.number)}</p>
                  <p className="font-serif text-xl leading-tight">{p.title}</p>
                  <p className="text-sm">{p.pricePence ? formatPrice(p.pricePence) : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-6 font-serif text-3xl font-light">Prints & more</h2>
        {products.length === 0 ? (
          <p className="opacity-70">Prints are coming soon.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {products.map((p) => {
              const from = Math.min(...p.variants.map((v) => v.price_pence));
              return (
                <li key={p.id}>
                  <Link href={`/shop/${p.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden bg-[#efe9df]">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                      {p.membersFirst && <span className="absolute top-3 left-3 rounded-full bg-pink px-2.5 py-1 text-xs text-cream">Hive first</span>}
                    </div>
                    <p className="mt-3 leading-tight">{p.name}</p>
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

export default function ShopPage() {
  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <h1 className="mb-12 font-serif text-5xl font-light md:text-6xl">Shop</h1>
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
