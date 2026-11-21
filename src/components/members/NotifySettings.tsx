"use client";

import { useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription, setEmailUpdates } from "@/app/members/inbox/actions";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

const toBytes = (b64: string) => {
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

type PushState = "unsupported" | "needs-install" | "off" | "on" | "blocked" | "working";

/** Phone notifications (installed app) and email updates for member messages. */
export function NotifySettings({ emailOn }: { emailOn: boolean }) {
  const [push, setPush] = useState<PushState>("working");
  const [email, setEmail] = useState(emailOn);

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !KEY) return setPush(ios && !standalone ? "needs-install" : "unsupported");
      if (Notification.permission === "denied") return setPush("blocked");
      const reg = await navigator.serviceWorker.ready;
      setPush((await reg.pushManager.getSubscription()) ? "on" : "off");
    })().catch(() => setPush("unsupported"));
  }, []);

  async function turnOn() {
    setPush("working");
    try {
      if ((await Notification.requestPermission()) !== "granted") return setPush("blocked");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(KEY) });
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      setPush((await savePushSubscription(json)) ? "on" : "off");
    } catch { setPush("off"); }
  }
  async function turnOff() {
    setPush("working");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) { await removePushSubscription(sub.endpoint); await sub.unsubscribe(); }
    setPush("off");
  }

  const note: Record<PushState, string> = {
    unsupported: "This browser can't show notifications.",
    "needs-install": "On iPhone, add The Hive to your Home Screen first (Share → Add to Home Screen), then turn these on from the app.",
    off: "Get a buzz when there's new work, a private view or a party.",
    on: "On. You'll get a buzz for new work and invitations.",
    blocked: "Notifications are blocked for this app. Turn them on in your phone's settings.",
    working: "…",
  };

  return (
    <section className="mt-10 border-t border-white/10 pt-6">
      <p className="mb-4 text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">Hear it first</p>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-h2 text-xl">Phone notifications</p>
          <p className="mt-1 max-w-xs text-sm opacity-60">{note[push]}</p>
        </div>
        {(push === "off" || push === "on") && (
          <button
            data-plain
            onClick={push === "on" ? turnOff : turnOn}
            role="switch"
            aria-checked={push === "on"}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${push === "on" ? "bg-honey" : "bg-white/20"}`}
          >
            <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-black transition-transform ${push === "on" ? "translate-x-6" : ""}`} />
          </button>
        )}
      </div>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-h2 text-xl">Email updates</p>
          <p className="mt-1 max-w-xs text-sm opacity-60">New work and invitations by email too. They&apos;re always in your inbox here either way.</p>
        </div>
        <button
          data-plain
          onClick={() => { setEmail(!email); setEmailUpdates(!email); }}
          role="switch"
          aria-checked={email}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${email ? "bg-honey" : "bg-white/20"}`}
        >
          <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-black transition-transform ${email ? "translate-x-6" : ""}`} />
        </button>
      </div>
    </section>
  );
}
