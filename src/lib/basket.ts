"use client";

import { useSyncExternalStore } from "react";

/** Basket kept in the browser. Prices shown here are for display only; checkout re-prices on the server. */
export type BasketItem = {
  kind: "painting" | "variant";
  id: string;
  label: string;
  pricePence: number;
  image?: string | null;
  qty: number;
};

const KEY = "janebee-basket";
const EMPTY: BasketItem[] = [];
let cache: BasketItem[] | null = null;
const listeners = new Set<() => void>();

function read(): BasketItem[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as BasketItem[];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: BasketItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode): basket lives for this page only
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) { cache = null; l(); }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

const actions = {
  add(item: Omit<BasketItem, "qty">, qty = 1) {
    const list = read();
    const existing = list.find((i) => i.id === item.id);
    if (existing) {
      if (item.kind === "painting") return; // originals: one of one
      write(list.map((i) => (i.id === item.id ? { ...i, qty: Math.min(10, i.qty + qty) } : i)));
    } else {
      write([...list, { ...item, qty: item.kind === "painting" ? 1 : qty }].slice(0, 10));
    }
  },
  setQty(id: string, qty: number) {
    write(read().map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)));
  },
  remove(id: string) {
    write(read().filter((i) => i.id !== id));
  },
  clear() {
    if (read().length) write([]);
  },
};

export function useBasket() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    totalPence: items.reduce((n, i) => n + i.qty * i.pricePence, 0),
    ...actions,
  };
}
