import "server-only";
import Stripe from "stripe";
import { serverClient } from "@/lib/supabase/server";

/** Delivery prices (pence). Edit here. UK only for now. */
export const SHIPPING = {
  prints: { label: "Royal Mail Tracked (UK)", pence: 495, days: [2, 4] as const },
  originals: { label: "Insured courier (UK)", pence: 2000, days: [3, 7] as const },
};

export type CartLine = { kind: "painting"; id: string } | { kind: "variant"; id: string; qty: number };

type Priced = { name: string; unit_pence: number; quantity: number; ref: { kind: "painting" | "variant"; id: string }; image?: string | null };

/** Re-price every line from the database (never trust prices from the browser). RLS hides anything the buyer can't see yet. */
async function priceLines(lines: CartLine[]): Promise<{ items: Priced[]; problems: string[] }> {
  const supabase = await serverClient();
  const problems: string[] = [];
  const items: Priced[] = [];

  const paintingIds = lines.filter((l) => l.kind === "painting").map((l) => l.id);
  const variantLines = lines.filter((l): l is Extract<CartLine, { kind: "variant" }> => l.kind === "variant");

  if (paintingIds.length) {
    const { data } = await supabase.from("paintings").select("id, title, status, price_pence").in("id", paintingIds);
    for (const id of new Set(paintingIds)) {
      const p = data?.find((d) => d.id === id);
      if (!p || p.status !== "available" || !p.price_pence) { problems.push(p ? `"${p.title}" has just sold` : "A work is no longer available"); continue; }
      items.push({ name: `${p.title} — original (one of one)`, unit_pence: p.price_pence, quantity: 1, ref: { kind: "painting", id } });
    }
  }
  if (variantLines.length) {
    const { data } = await supabase
      .from("product_variants")
      .select("id, name, price_pence, stock, products(name, active)")
      .in("id", variantLines.map((l) => l.id));
    for (const l of variantLines) {
      const v = data?.find((d) => d.id === l.id);
      const product = v?.products as unknown as { name: string; active: boolean } | null;
      if (!v || !product?.active) { problems.push("An item is no longer available"); continue; }
      const qty = Math.max(1, Math.min(10, Math.floor(l.qty)));
      if (v.stock !== null && v.stock < qty) { problems.push(`Only ${v.stock} left of ${product.name} (${v.name})`); continue; }
      items.push({ name: `${product.name} — ${v.name}`, unit_pence: v.price_pence, quantity: qty, ref: { kind: "variant", id: v.id } });
    }
  }
  return { items, problems };
}

/** Creates a Stripe Checkout session for the cart. Returns its URL, or an error message. */
export async function createCheckout(lines: CartLine[], cancelPath: string, base = ""): Promise<{ url?: string; error?: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { error: "Online checkout isn't switched on yet — please use Enquire and Jane will get back to you." };
  if (!lines.length) return { error: "Your basket is empty." };

  const { items, problems } = await priceLines(lines);
  if (problems.length || !items.length) return { error: problems.join(". ") || "Nothing to buy." };

  const supabase = await serverClient();
  const { data: auth } = await supabase.auth.getUser();
  const hasOriginal = items.some((i) => i.ref.kind === "painting");
  const ship = hasOriginal ? SHIPPING.originals : SHIPPING.prints;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await new Stripe(key).checkout.sessions.create({
    mode: "payment",
    line_items: items.map((i) => ({
      quantity: i.quantity,
      price_data: { currency: "gbp", unit_amount: i.unit_pence, product_data: { name: i.name } },
    })),
    shipping_address_collection: { allowed_countries: ["GB"] },
    shipping_options: [{
      shipping_rate_data: {
        type: "fixed_amount",
        display_name: ship.label,
        fixed_amount: { amount: ship.pence, currency: "gbp" },
        delivery_estimate: { minimum: { unit: "business_day", value: ship.days[0] }, maximum: { unit: "business_day", value: ship.days[1] } },
      },
    }],
    customer_email: auth.user?.email,
    client_reference_id: auth.user?.id,
    // compact list of what was bought, read back by the webhook
    metadata: { refs: JSON.stringify(items.map((i) => [i.ref.kind === "painting" ? "p" : "v", i.ref.id, i.quantity])) },
    // left unpaid? After an hour the session expires; if the buyer ticked Stripe's
    // "keep me updated" box (or is a member) the webhook keeps the basket for one reminder email
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    after_expiration: { recovery: { enabled: true } },
    consent_collection: { promotions: "auto" },
    success_url: `${site}${base}/shop/thank-you?session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}${cancelPath}`,
  });
  return { url: session.url! };
}
