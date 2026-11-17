"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/painting";
import { AddToBasket } from "./AddToBasket";
import type { Tone } from "@/components/views/tone";

type Variant = { id: string; name: string; price_pence: number; stock: number | null };

export function VariantPicker({ productName, image, variants, base = "", tone = "dark" }: { productName: string; image: string | null; variants: Variant[]; base?: string; tone?: Tone }) {
  const firstInStock = variants.find((v) => v.stock === null || v.stock > 0) ?? variants[0];
  const [id, setId] = useState(firstInStock?.id);
  const v = variants.find((x) => x.id === id);
  if (!v) return null;
  const soldOut = v.stock !== null && v.stock <= 0;

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-xs tracking-[0.2em] uppercase opacity-60">Size</legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((x) => {
            const out = x.stock !== null && x.stock <= 0;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => setId(x.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-all hover:-translate-y-0.5 ${x.id === id ? (tone === "dark" ? "border-cream bg-cream text-espresso" : "border-espresso bg-espresso text-cream") : "border-current/30"} ${out ? "line-through opacity-50" : ""}`}
              >
                {x.name} · {formatPrice(x.price_pence)}
              </button>
            );
          })}
        </div>
        {v.stock !== null && v.stock > 0 && v.stock <= 5 && <p className="mt-2 text-sm text-grey">Only {v.stock} left</p>}
      </fieldset>
      <AddToBasket line={{ kind: "variant", id: v.id }} label={`${productName} — ${v.name}`} pricePence={v.price_pence} image={image} disabled={soldOut} base={base} tone={tone} />
      {soldOut && <p className="text-sm opacity-70">This size is sold out.</p>}
    </div>
  );
}
