"use server";

import { getViewer } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

type Item = { kind: "painting" | "variant"; id: string; label: string; pricePence: number; image?: string | null; qty: number };

/**
 * Keeps a signed-in member's basket on file so a reminder can go out if they
 * leave without buying. Guests are covered at checkout instead (Stripe asks
 * for consent). Prices here are display-only; checkout re-prices everything.
 */
export async function syncBasket(raw: Item[]): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) return;
  const items = (Array.isArray(raw) ? raw : [])
    .filter((i) => (i.kind === "painting" || i.kind === "variant") && /^[0-9a-f-]{36}$/.test(i.id))
    .slice(0, 10)
    .map((i) => ({
      kind: i.kind, id: i.id, label: String(i.label).slice(0, 140), qty: Math.max(1, Math.min(10, Number(i.qty) || 1)),
      pricePence: Math.max(0, Math.round(Number(i.pricePence) || 0)), image: typeof i.image === "string" && /^https?:\/\/|^\//.test(i.image) ? i.image : null,
    }));
  const supabase = await serverClient();
  const now = new Date().toISOString();
  await supabase.from("baskets").upsert(
    {
      member_id: viewer.id,
      email: viewer.email || null,
      first_name: viewer.firstName,
      items,
      total_pence: items.reduce((n, i) => n + i.qty * i.pricePence, 0),
      status: items.length ? "open" : "emptied",
      reminders: 0,
      last_reminded_at: null,
      updated_at: now,
    },
    { onConflict: "member_id" },
  );
}
