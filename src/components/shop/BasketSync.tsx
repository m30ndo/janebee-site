"use client";

import { useEffect, useRef } from "react";
import { useBasket } from "@/lib/basket";
import { syncBasket } from "@/app/basket-actions";

/** Sends a signed-in member's basket to the server a moment after it changes (for the "you left something" reminder). */
export function BasketSync() {
  const { items } = useBasket();
  const key = JSON.stringify(items.map((i) => [i.id, i.qty]));
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current === null) { last.current = key; if (!items.length) return; } // first load: only sync a non-empty basket
    else if (last.current === key) return;
    last.current = key;
    const t = setTimeout(() => { syncBasket(items).catch(() => {}); }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
