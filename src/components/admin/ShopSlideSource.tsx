"use client";

import { useState } from "react";
import { inputCls } from "@/components/admin/ui";
import type { SlideSource } from "@/lib/shop-carousel";

type Opt = { id: string; label: string };

/** What a slide shows: an original, a print/product, or your own image + link. Only the matching picker shows. */
export function ShopSlideSource({ initial = "original", paintingId = "", productId = "", originals, products }: {
  initial?: SlideSource; paintingId?: string; productId?: string; originals: Opt[]; products: Opt[];
}) {
  const [source, setSource] = useState<SlideSource>(initial);
  return (
    <>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-white/90">Slide shows</span>
        <select name="source" value={source} onChange={(e) => setSource(e.target.value as SlideSource)} className={inputCls}>
          <option value="original">An original painting</option>
          <option value="product">A print or product</option>
          <option value="custom">My own image and link</option>
        </select>
        <span className="mt-1 block text-xs text-white/50">
          {source === "custom" ? "Upload an image and add where it goes (a page here, or any website)." : "Uses its photo, title, price and page. Sold or hidden works drop out on their own."}
        </span>
      </label>
      {source === "original" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/90">Original</span>
          <select name="painting_id" defaultValue={paintingId} className={inputCls}>
            <option value="">— Pick one —</option>
            {originals.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
      )}
      {source === "product" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/90">Print or product</span>
          <select name="product_id" defaultValue={productId} className={inputCls}>
            <option value="">— Pick one —</option>
            {products.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
      )}
      {source === "custom" && <div className="hidden md:block" />}
    </>
  );
}
