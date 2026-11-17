"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the app's bottom menu is tucked away. Shared so screens that sit
 * above the menu (the gallery HUD) can drop down when it slides out.
 * Remembered on this device.
 */
const KEY = "hive-tabbar-hidden";
const listeners = new Set<() => void>();
let hidden: boolean | null = null;

const read = () => {
  if (hidden === null) {
    try { hidden = localStorage.getItem(KEY) === "1"; } catch { hidden = false; }
  }
  return hidden;
};

export const tabBar = {
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  isHidden: read,
  setHidden(v: boolean) {
    hidden = v;
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch {}
    listeners.forEach((l) => l());
  },
  toggle() { tabBar.setHidden(!read()); },
};

export const TAB_BAR_HEIGHT = 64;

export function useTabBarHidden() {
  return useSyncExternalStore(tabBar.subscribe, tabBar.isHidden, () => false);
}
