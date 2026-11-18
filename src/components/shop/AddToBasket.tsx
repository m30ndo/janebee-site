"use client";

import Link from "next/link";
import { useState } from "react";
import { useBasket } from "@/lib/basket";
import { outlineBtn, solidBtn, type Tone } from "@/components/views/tone";

type Line = { kind: "painting"; id: string } | { kind: "variant"; id: string };

export function AddToBasket({
  line, label, pricePence, image, variant = "solid", disabled, base = "", tone = "dark",
}: {
  line: Line; label: string; pricePence: number; image?: string | null; variant?: "solid" | "outline"; disabled?: boolean; base?: string; tone?: Tone;
}) {
  const basket = useBasket();
  const [added, setAdded] = useState(false);
  const inBasket = basket.items.some((i) => i.id === line.id);
  const cls = variant === "solid" ? solidBtn(tone) : outlineBtn(tone);

  if ((added || inBasket) && line.kind === "painting") {
    return (
      <Link href={`${base}/basket`} className={`block w-full text-center ${outlineBtn(tone)}`}>
        In your basket — view basket →
      </Link>
    );
  }
  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { basket.add({ ...line, label, pricePence, image }); setAdded(true); }}
        className={`w-full disabled:opacity-50 ${cls}`}
      >
        Add to basket
      </button>
      {added && line.kind === "variant" && (
        <p className="animate-rise mt-2 text-center text-sm">Added. <Link href={`${base}/basket`} className="underline underline-offset-4">View basket</Link></p>
      )}
    </div>
  );
}

/** `phoneOnlyWhenFull`: on phones, only show the link once something is in the basket. */
export function BasketLink({ base = "", phoneOnlyWhenFull = false }: { base?: string; phoneOnlyWhenFull?: boolean }) {
  const { count } = useBasket();
  return (
    <Link href={`${base}/basket`} className={`hover:text-honey ${phoneOnlyWhenFull && count === 0 ? "hidden md:inline" : ""}`}>
      Basket{count > 0 && <span className="ml-1 rounded-full bg-honey px-1.5 text-xs text-espresso">{count}</span>}
    </Link>
  );
}
