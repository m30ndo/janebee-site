"use server";

import { redirect } from "next/navigation";
import { publicClient } from "@/lib/supabase/public";
import { createCheckout, type CartLine } from "@/lib/shop";

export type FormState = { status: "idle" | "ok" | "error"; message: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** The Hive mailing list sign-up. */
export async function joinHive(_prev: FormState, data: FormData): Promise<FormState> {
  if (data.get("company")) return { status: "ok", message: "You're in the Hive." }; // honeypot
  const email = String(data.get("email") ?? "").trim();
  const firstName = String(data.get("first_name") ?? "").trim().slice(0, 80) || null;
  const source = String(data.get("source") ?? "site").slice(0, 50);

  if (!EMAIL.test(email)) return { status: "error", message: "Please enter a valid email address." };
  if (data.get("consent") !== "on") return { status: "error", message: "Please tick the box so Jane can email you." };

  const { error } = await publicClient().from("hive_signups").insert({ email, first_name: firstName, consent: true, source });
  if (error?.code === "23505") return { status: "ok", message: "You're already in the Hive. Good taste." };
  if (error) return { status: "error", message: "Something went wrong. Please try again in a moment." };
  return { status: "ok", message: `You're in the Hive${firstName ? `, ${firstName}` : ""}.` };
}

/** General, commission and per-painting enquiries. */
export async function sendEnquiry(_prev: FormState, data: FormData): Promise<FormState> {
  if (data.get("company")) return { status: "ok", message: "Thank you." };
  const name = String(data.get("name") ?? "").trim().slice(0, 120);
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim().slice(0, 5000);
  const kind = String(data.get("kind") ?? "general");
  const paintingId = String(data.get("painting_id") ?? "") || null;

  if (!name) return { status: "error", message: "Please add your name." };
  if (!EMAIL.test(email)) return { status: "error", message: "Please enter a valid email address." };
  if (!message) return { status: "error", message: "Please add a message." };

  const { error } = await publicClient().from("enquiries").insert({
    name, email, message, painting_id: paintingId,
    kind: ["general", "commission", "piece"].includes(kind) ? kind : "general",
  });
  if (error) return { status: "error", message: "Something went wrong. Please try again in a moment." };
  // TODO (phase 2): email Jane a copy via Resend.
  return { status: "ok", message: "Thank you. Jane will be in touch." };
}

/** "Buy" on a single original (gallery pop-up and work page). */
const appBase = (d: FormData) => (d.get("base") === "/members" ? "/members" : "");

export async function buyPainting(data: FormData) {
  const slug = String(data.get("slug") ?? "");
  const base = appBase(data);
  const { serverClient } = await import("@/lib/supabase/server");
  const { data: painting } = await (await serverClient()).from("paintings").select("id").eq("slug", slug).maybeSingle();
  if (!painting) redirect(`${base}/gallery`);
  const result = await createCheckout([{ kind: "painting", id: painting.id }], `${base}/work/${slug}`, base);
  if (result.error) redirect(`${base}/work/${slug}?checkout=${encodeURIComponent(result.error)}#enquire`);
  redirect(result.url!);
}

/** Basket checkout. The browser sends only ids and quantities; prices are looked up on the server. */
export async function checkoutBasket(_prev: { error: string }, data: FormData): Promise<{ error: string }> {
  let lines: CartLine[] = [];
  try {
    const raw = JSON.parse(String(data.get("lines") ?? "[]")) as CartLine[];
    lines = raw
      .filter((l) => (l.kind === "painting" || l.kind === "variant") && typeof l.id === "string" && /^[0-9a-f-]{36}$/.test(l.id))
      .slice(0, 10)
      .map((l) => (l.kind === "variant" ? { kind: "variant", id: l.id, qty: Number(l.qty) || 1 } : { kind: "painting", id: l.id }));
  } catch {
    return { error: "Your basket couldn't be read. Please try again." };
  }
  const base = appBase(data);
  const result = await createCheckout(lines, `${base}/basket`, base);
  if (result.error) return { error: result.error };
  redirect(result.url!);
}
