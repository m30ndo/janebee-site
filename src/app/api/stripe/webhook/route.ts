import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import Stripe from "stripe";
import { adminClient } from "@/lib/supabase/server";

/**
 * Stripe → orders. On a completed checkout: record the order, mark originals
 * "Sold — the story stays", and take print stock down.
 * Needs STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and SUPABASE_SECRET_KEY.
 */
export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) return new NextResponse("Stripe not configured", { status: 500 });

  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new NextResponse("Bad signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ ignored: event.type });
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return NextResponse.json({ waiting: true });

  const db = adminClient();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 50 });
  const refs = JSON.parse(session.metadata?.refs ?? "[]") as [string, string, number][];
  const shipping =
    (session as unknown as { collected_information?: { shipping_details?: unknown } }).collected_information?.shipping_details ??
    (session as unknown as { shipping_details?: unknown }).shipping_details ??
    null;

  const { error } = await db.from("orders").insert({
    stripe_session_id: session.id,
    member_id: session.client_reference_id || null,
    email: session.customer_details?.email ?? session.customer_email,
    status: "paid",
    amount_pence: session.amount_total,
    items: lineItems.data.map((li) => ({ name: li.description, quantity: li.quantity ?? 1, amount_pence: li.amount_total })),
    shipping,
  });
  // 23505 = already recorded (Stripe retries are safe)
  if (error && error.code !== "23505") return new NextResponse(error.message, { status: 500 });
  if (error?.code === "23505") return NextResponse.json({ duplicate: true });

  const paintingIds = refs.filter(([k]) => k === "p").map(([, id]) => id);
  if (paintingIds.length) await db.from("paintings").update({ status: "sold", updated_at: new Date().toISOString() }).in("id", paintingIds);

  for (const [, id, qty] of refs.filter(([k]) => k === "v")) {
    const { data: v } = await db.from("product_variants").select("stock").eq("id", id).maybeSingle();
    if (v && v.stock !== null) await db.from("product_variants").update({ stock: Math.max(0, v.stock - qty) }).eq("id", id);
  }

  revalidateTag("gallery", { expire: 0 });
  return NextResponse.json({ ok: true });
}
