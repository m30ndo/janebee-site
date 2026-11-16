"use client";

import { useEffect } from "react";
import { useBasket } from "@/lib/basket";

/** Empties the basket after a successful checkout. */
export function ClearBasket() {
  const { clear } = useBasket();
  useEffect(() => { clear(); }, [clear]);
  return null;
}
