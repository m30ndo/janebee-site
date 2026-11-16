"use client";

import { useEffect } from "react";

/** Registers the service worker so the members app can be installed and opens offline. */
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
