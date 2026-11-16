"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "hive-install-dismissed";

function readEnv() {
  if (typeof window === "undefined") return "server";
  const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  if (standalone) return "installed";
  let dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === "1"; } catch {}
  if (dismissed) return "dismissed";
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "other";
}

/** "Add the Hive to your home screen" — native prompt on Android/desktop, instructions on iPhone. */
export function InstallPrompt() {
  const env = useSyncExternalStore(() => () => {}, readEnv, () => "server");
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as InstallEvent); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
  };

  if (hidden || env === "server" || env === "installed" || env === "dismissed") return null;
  if (env === "other" && !deferred) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-2xl bg-cream p-4 text-espresso shadow-2xl">
      <p className="font-serif text-lg">Add the Hive to your home screen</p>
      {env === "ios" ? (
        <p className="mt-1 text-sm opacity-80">Tap <b>Share</b> <span aria-hidden>⬆︎</span> then <b>Add to Home Screen</b>. New work lands here first.</p>
      ) : (
        <p className="mt-1 text-sm opacity-80">Open it like an app. New work lands here first.</p>
      )}
      <div className="mt-3 flex gap-3">
        {deferred && (
          <button
            onClick={async () => { await deferred.prompt(); await deferred.userChoice; setDeferred(null); dismiss(); }}
            className="rounded-full bg-espresso px-5 py-2 text-sm font-medium text-cream"
          >
            Install
          </button>
        )}
        <button onClick={dismiss} className="text-sm underline underline-offset-4 opacity-70">Not now</button>
      </div>
    </div>
  );
}
