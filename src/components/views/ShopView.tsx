"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IconClose, IconMenu } from "@/components/members/icons";
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
 * room filter for originals. Every card is the same size (the carousel above features work).
 */
export function ShopView({ originals, products, base = "", tone = "dark" }: { originals: Painting[]; products: ShopProduct[]; base?: string; tone?: Tone }) {
  const [show, setShow] = useState<Show>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [room, setRoom] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.documentElement.style.overflow = ""; };
  }, [menu]);
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
  const current = tabs.find((t) => t.key === show) ?? tabs[0];
  // the carousel above does the showing-off now, so every card is the same size; the newest just gets a tag
  const newestFirst = sort === "new" && !room;

  return (
    <>
      {/* menu bar: what you're looking at, and one tap opens every option */}
      <div className={`z-20 mb-10 bg-black/85 py-3 backdrop-blur-md md:mb-14 ${base === "/members" ? "sticky top-0" : "sticky top-[65px]"}`}>
        <button
          data-plain
          onClick={() => setMenu(true)}
          aria-haspopup="dialog"
          aria-expanded={menu}
          className="group flex w-full items-center gap-4 rounded-full border border-white/15 py-1.5 pr-5 pl-1.5 text-left transition-colors hover:border-honey"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-honey text-black"><IconMenu /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold tracking-[0.3em] text-white/50 uppercase">Showing</span>
            <span className="block truncate font-h2 text-xl leading-tight">
              {current.label}{show !== "prints" && room ? ` · ${roomName(room)}` : ""} <sup className="text-[10px] opacity-60">{current.n}</sup>
            </span>
          </span>
          <span className="shrink-0 text-xs tracking-[0.2em] text-white/60 uppercase transition-colors group-hover:text-honey">{sortShort[sort]} ▾</span>
        </button>
      </div>

      {menu && createPortal(
        <div role="dialog" aria-label="Shop menu" className="animate-fade fixed inset-0 z-[200] flex flex-col bg-black/95 text-white backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 md:px-8">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">The Shop · Menu</p>
            <button data-plain onClick={() => setMenu(false)} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:text-honey"><IconClose /></button>
          </div>
          <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-5 pb-10 md:px-8">
            <ol>
              {tabs.map((t, i) => {
                const on = show === t.key;
                return (
                  <li key={t.key} className="border-b border-white/10">
                    <button data-plain onClick={() => { setShow(t.key); if (t.key === "prints") setRoom(null); setMenu(false); }}
                      className={`flex w-full items-baseline gap-4 py-5 text-left transition-colors ${on ? "text-honey" : "text-white hover:text-honey"}`}>
                      <span className="w-6 shrink-0 text-xs tabular-nums opacity-50">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`flex-1 font-h2 text-4xl leading-none md:text-5xl ${on ? "italic" : "font-light"}`}>{t.label}</span>
                      <span className="text-sm tabular-nums opacity-50">{t.n}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {rooms.length > 1 && (
              <>
                <p className="mt-10 mb-2 text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">Originals by room</p>
                <ul>
                  {[null, ...rooms].map((r) => {
                    const on = room === r && show !== "prints";
                    return (
                      <li key={r ?? "all"} className="border-b border-white/10">
                        <button data-plain onClick={() => { setRoom(r); if (show === "prints") setShow("originals"); setMenu(false); }}
                          className={`flex w-full items-baseline justify-between gap-4 py-4 text-left capitalize transition-colors ${on ? "text-honey" : "text-white/85 hover:text-honey"}`}>
                          <span className={`font-h2 text-2xl leading-none ${on ? "italic" : "font-light"}`}>{r ? roomName(r) : "All rooms"}</span>
                          <span className="text-sm tabular-nums opacity-50">{r ? originals.filter((p) => p.collectionSlug === r).length : originals.length}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <p className="mt-10 mb-3 text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">Sort</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(sortLabel) as Sort[]).map((k) => (
                <button key={k} data-plain onClick={() => { setSort(k); setMenu(false); }}
                  className={`rounded-full border px-5 py-2.5 text-[11px] font-medium tracking-[0.14em] uppercase transition-colors ${sort === k ? "border-honey bg-honey text-black" : "border-white/20 text-white/80 hover:border-white/50"}`}>
                  {sortLabel[k]}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {show !== "prints" && (
        <section id="originals" className="mb-20 scroll-mt-32">
          <SectionHead title="Originals" kicker={room ? roomName(room)! : "One of one"} note="Every painting exists once. When it's gone, it's gone." />

          {shownOriginals.length === 0 ? (
            <Empty text="Every original has found a home. New work reaches the Hive first." base={base} />
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {shownOriginals.map((p, i) => (
                <li key={p.id} className="animate-rise"><OriginalCard p={p} base={base} tone={tone} newest={i === 0 && newestFirst} /></li>
              ))}
            </ul>
          )}
        </section>
      )}

      {show !== "originals" && (
        <section id="prints" className="mb-20 scroll-mt-32">
          <SectionHead title="Prints & more" kicker="Limited runs" note="Printed on proper paper. Members get first dibs." />
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

const sortShort: Record<Sort, string> = { new: "Newest", low: "Price ↑", high: "Price ↓" };
const sortLabel: Record<Sort, string> = { new: "Newest", low: "Price: low to high", high: "Price: high to low" };

function SectionHead({ title, kicker, note }: { title: string; kicker: string; note: string }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-white/15 pb-4">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">{kicker}</p>
        <h2 className="mt-1 font-h2 text-4xl font-light md:text-5xl">{title}</h2>
      </div>
      <p className="max-w-xs text-sm opacity-60 md:text-right">{note}</p>
    </header>
  );
}

function OriginalCard({ p, base, tone, newest = false }: { p: Painting; base: string; tone: Tone; newest?: boolean }) {
  const { items, add } = useBasket();
  const inBasket = items.some((i) => i.id === p.id);
  const href = `${base}/work/${p.slug}`;
  return (
    <div className="group">
      <Link href={href} className="block">
        <div className={`img-hover relative aspect-[4/5] ${imgBg(tone)}`}>
          {p.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
          )}
          <span className="absolute top-3 left-3 bg-black px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-honey uppercase">One of one</span>
          {newest && <span className="absolute top-3 right-3 bg-honey px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-black uppercase">Newest</span>}
          <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-white/90 py-2 text-center text-[11px] tracking-[0.2em] text-black uppercase opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:block">
            Come closer
          </span>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <Link href={href} className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50">{[paintingNumber(p.number), roomName(p.collectionSlug)].filter(Boolean).join(" · ")}</p>
          <p className="font-h2 text-xl leading-tight transition-colors group-hover:text-honey">{p.title}</p>
          <p className="mt-1 text-xs opacity-60">{[p.medium, sizeOf(p)].filter(Boolean).join(" · ")}</p>
        </Link>
        {p.pricePence ? <p className="shrink-0 font-h2 text-lg">{formatPrice(p.pricePence)}</p> : null}
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
