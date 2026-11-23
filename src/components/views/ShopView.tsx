"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice, paintingNumber, type Painting } from "@/lib/painting";
import type { ShopProduct } from "@/lib/data";
import { useBasket } from "@/lib/basket";
import { imgBg, type Tone } from "./tone";

type Show = "all" | "originals" | "prints";
type Sort = "new" | "low" | "high";

const roomName = (slug: string | null) => (slug ? slug.replace(/-/g, " ") : null);
const sizeOf = (p: Painting) => (p.widthCm && p.heightCm ? `${p.widthCm} × ${p.heightCm} cm` : null);
const fromPrice = (p: ShopProduct) => Math.min(...p.variants.map((v) => v.price_pence));
const stockOf = (p: ShopProduct) => {
  const tracked = p.variants.filter((v) => v.stock !== null);
  if (!tracked.length || tracked.length < p.variants.length) return { soldOut: false, low: null as number | null };
  const total = tracked.reduce((n, v) => n + (v.stock ?? 0), 0);
  return { soldOut: total === 0, low: total > 0 && total <= 5 ? total : null };
};

/**
 * The shop: originals (one of one) and prints, with a filter bar, sorting and a
 * room filter for originals. The newest original gets the big frame.
 */
export function ShopView({ originals, products, base = "", tone = "dark" }: { originals: Painting[]; products: ShopProduct[]; base?: string; tone?: Tone }) {
  const [show, setShow] = useState<Show>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [room, setRoom] = useState<string | null>(null);
  const rooms = useMemo(() => [...new Set(originals.map((p) => p.collectionSlug).filter(Boolean))] as string[], [originals]);

  const shownOriginals = useMemo(() => {
    const list = room ? originals.filter((p) => p.collectionSlug === room) : [...originals];
    if (sort === "low") list.sort((a, b) => (a.pricePence ?? 0) - (b.pricePence ?? 0));
    if (sort === "high") list.sort((a, b) => (b.pricePence ?? 0) - (a.pricePence ?? 0));
    return list;
  }, [originals, room, sort]);
  const shownProducts = useMemo(() => {
    const list = [...products];
    if (sort === "low") list.sort((a, b) => fromPrice(a) - fromPrice(b));
    if (sort === "high") list.sort((a, b) => fromPrice(b) - fromPrice(a));
    return list;
  }, [products, sort]);

  const tabs: { key: Show; label: string; n: number }[] = [
    { key: "all", label: "Everything", n: originals.length + products.length },
    { key: "originals", label: "Originals", n: originals.length },
    { key: "prints", label: "Prints & more", n: products.length },
  ];
  const [feature, ...restOriginals] = shownOriginals;
  const featureFirst = sort === "new" && !room && !!feature;

  return (
    <>
      {/* filter bar */}
      <div className={`mb-10 border-y border-white/15 bg-black/85 backdrop-blur-md md:mb-14 ${base === "/members" ? "sticky top-0 z-20" : "sticky top-[65px] z-20"}`}>
        <div className="flex flex-wrap items-stretch justify-between gap-x-6">
          <div role="tablist" aria-label="Show" className="flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const on = show === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setShow(t.key)}
                  data-plain
                  className={`relative shrink-0 px-4 py-4 transition-colors first:pl-0 ${on ? "text-honey" : "text-white/70 hover:text-white"}`}
                >
                  <span className={`font-h2 text-lg whitespace-nowrap md:text-2xl ${on ? "italic" : "font-light"}`}>{t.label}</span>
                  <sup className="ml-1 text-[10px] opacity-60">{t.n}</sup>
                  <span className={`absolute right-4 bottom-0 left-4 h-[2px] origin-left bg-honey transition-transform duration-500 group-first:left-0 ${on ? "scale-x-100" : "scale-x-0"}`} />
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 py-3 text-[11px] tracking-[0.2em] text-white/60 uppercase">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="border border-white/20 bg-black px-2 py-1.5 text-[11px] tracking-[0.15em] text-white uppercase outline-none focus:border-honey [&>option]:bg-black"
            >
              <option value="new">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      {show !== "prints" && (
        <section id="originals" className="mb-20 scroll-mt-32">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="flex items-baseline gap-3 font-h2 text-4xl font-light md:text-5xl">
              Originals <span className="font-hand text-2xl text-pink">one of one</span>
            </h2>
            {rooms.length > 1 && (
              <div className="flex flex-wrap gap-2" aria-label="Filter by room">
                {[null, ...rooms].map((r) => (
                  <button
                    key={r ?? "all"}
                    data-plain
                    onClick={() => setRoom(r)}
                    className={`border px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-colors ${room === r ? "border-honey bg-honey text-black" : "border-white/20 text-white/70 hover:border-honey hover:text-honey"}`}
                  >
                    {r ? roomName(r) : "All rooms"}
                  </button>
                ))}
              </div>
            )}
          </header>

          {shownOriginals.length === 0 ? (
            <Empty text="Every original has found a home. New work reaches the Hive first." base={base} />
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {featureFirst && (
                <li className="col-span-2 md:row-span-2">
                  <OriginalCard p={feature} base={base} tone={tone} big />
                </li>
              )}
              {(featureFirst ? restOriginals : shownOriginals).map((p) => (
                <li key={p.id} className="animate-rise"><OriginalCard p={p} base={base} tone={tone} /></li>
              ))}
            </ul>
          )}
        </section>
      )}

      {show !== "originals" && (
        <section id="prints" className="mb-20 scroll-mt-32">
          <header className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-h2 text-4xl font-light md:text-5xl">Prints <span className="text-honey italic">&amp; more</span></h2>
            <p className="hidden max-w-xs text-right text-sm opacity-60 md:block">Limited runs, printed on proper paper. Members get first dibs.</p>
          </header>
          {shownProducts.length === 0 ? (
            <Empty text="Prints are coming soon. Join the Hive to hear first." base={base} />
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {shownProducts.map((p) => <li key={p.id} className="animate-rise"><ProductCard p={p} base={base} tone={tone} /></li>)}
            </ul>
          )}
        </section>
      )}

      <TrustStrip base={base} />
    </>
  );
}

function OriginalCard({ p, base, tone, big = false }: { p: Painting; base: string; tone: Tone; big?: boolean }) {
  const { items, add } = useBasket();
  const inBasket = items.some((i) => i.id === p.id);
  const href = `${base}/work/${p.slug}`;
  return (
    <div className="group">
      <Link href={href} className="block">
        <div className={`img-hover relative ${big ? "aspect-[4/5] md:aspect-auto md:h-[min(78vh,56rem)]" : "aspect-[4/5]"} ${imgBg(tone)}`}>
          {p.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.title} className="h-full w-full object-cover" loading={big ? "eager" : "lazy"} />
          )}
          <span className="absolute top-3 left-3 bg-black px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-honey uppercase">One of one</span>
          {big && <span className="absolute top-3 right-3 bg-honey px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-black uppercase">Newest</span>}
          <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-white/90 py-2 text-center text-[11px] tracking-[0.2em] text-black uppercase opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:block">
            Come closer
          </span>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <Link href={href} className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50">{[paintingNumber(p.number), roomName(p.collectionSlug)].filter(Boolean).join(" · ")}</p>
          <p className={`font-h2 leading-tight transition-colors group-hover:text-honey ${big ? "text-3xl md:text-4xl" : "text-xl"}`}>{p.title}</p>
          <p className="mt-1 text-xs opacity-60">{[p.medium, sizeOf(p)].filter(Boolean).join(" · ")}</p>
        </Link>
        {p.pricePence ? <p className={`shrink-0 font-h2 ${big ? "text-2xl" : "text-lg"}`}>{formatPrice(p.pricePence)}</p> : null}
      </div>
      {p.pricePence ? (
        inBasket ? (
          <Link href={`${base}/basket`} className="mt-3 block border border-honey py-2.5 text-center text-[11px] tracking-[0.2em] text-honey uppercase">In your basket →</Link>
        ) : (
          <button
            data-plain
            onClick={() => add({ kind: "painting", id: p.id, label: p.title, pricePence: p.pricePence!, image: p.image })}
            className="mt-3 w-full border border-white/25 py-2.5 text-[11px] tracking-[0.2em] uppercase transition-colors hover:border-honey hover:bg-honey hover:text-black"
          >
            Add to basket
          </button>
        )
      ) : (
        <Link href={`${href}#enquire`} className="mt-3 block border border-white/25 py-2.5 text-center text-[11px] tracking-[0.2em] uppercase hover:border-honey hover:text-honey">Enquire</Link>
      )}
    </div>
  );
}

function ProductCard({ p, base, tone }: { p: ShopProduct; base: string; tone: Tone }) {
  const from = fromPrice(p);
  const { soldOut, low } = stockOf(p);
  return (
    <Link href={`${base}/shop/${p.slug}`} className="group block">
      <div className={`img-hover relative aspect-square ${imgBg(tone)}`}>
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} className={`h-full w-full object-cover ${soldOut ? "opacity-40 grayscale" : ""}`} loading="lazy" />
        )}
        <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {p.membersFirst && <span className="bg-pink px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-black uppercase">Hive first</span>}
          {soldOut && <span className="bg-white px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-black uppercase">Sold out</span>}
          {low && <span className="bg-honey px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-black uppercase">Only {low} left</span>}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50">{p.kind}{p.variants.length > 1 ? ` · ${p.variants.length} sizes` : ""}</p>
          <p className="font-h2 text-xl leading-tight transition-colors group-hover:text-honey">{p.name}</p>
        </div>
        {Number.isFinite(from) && <p className="shrink-0 text-sm"><span className="text-[10px] uppercase opacity-60">from </span><span className="font-h2 text-lg">{formatPrice(from)}</span></p>}
      </div>
      <span className="mt-3 block border border-white/25 py-2.5 text-center text-[11px] tracking-[0.2em] uppercase transition-colors group-hover:border-honey group-hover:bg-honey group-hover:text-black">
        {soldOut ? "Have a look" : "Choose a size"}
      </span>
    </Link>
  );
}

function Empty({ text, base }: { text: string; base: string }) {
  return (
    <div className="border border-dashed border-white/20 p-8 text-center">
      <p className="opacity-70">{text}</p>
      {base !== "/members" && <Link href="/the-hive" className="link-draw mt-3 inline-block text-sm text-honey">Join the Hive →</Link>}
    </div>
  );
}

function TrustStrip({ base }: { base: string }) {
  const items = [
    { t: "Packed by hand", d: "In the studio, with care and too much tape", href: `${base}/legal/shipping` },
    { t: "UK delivery", d: "Tracked prints · insured originals", href: `${base}/legal/shipping` },
    { t: "14-day returns", d: "Changed your mind? That's fine", href: `${base}/legal/returns` },
    { t: "Secure checkout", d: "Paid safely through Stripe", href: `${base}/legal/terms` },
  ];
  return (
    <ul className="grid grid-cols-2 border-t border-white/15 md:grid-cols-4">
      {items.map((i) => (
        <li key={i.t} className="border-b border-white/15 odd:border-r md:border-r md:last:border-r-0">
          <Link href={i.href} className="group block p-5 md:p-6">
            <p className="font-h2 text-lg transition-colors group-hover:text-honey">{i.t}</p>
            <p className="mt-1 text-xs leading-relaxed opacity-60">{i.d}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
