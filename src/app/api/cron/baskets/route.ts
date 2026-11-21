import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/server";
import { brandEmail, emailConfigured, sendEmails, unsubscribeUrl, type Email } from "@/lib/email";
import { normaliseBasketSettings } from "@/lib/basket-reminders";

const money = (p: number) => `£${(p / 100).toFixed(2)}`;

/**
 * Basket reminders. Run hourly (Vercel Cron, or Supabase pg_cron → this URL)
 * with `Authorization: Bearer $CRON_SECRET`. First email after
 * `firstAfterHours`, an optional last nudge after `secondAfterHours`, never more.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorised", { status: 401 });
  if (!emailConfigured()) return NextResponse.json({ skipped: "email not set up" });

  const db = adminClient();
  const { data: row } = await db.from("site_settings").select("value").eq("key", "basket_reminders").maybeSingle();
  const cfg = normaliseBasketSettings(row?.value);
  if (!cfg.enabled) return NextResponse.json({ skipped: "turned off in Studio" });

  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
  const { data: due } = await db
    .from("baskets")
    .select("id, email, first_name, items, total_pence, recovery_url, member_id, reminders, updated_at, last_reminded_at, status")
    .in("status", ["open", "reminded"])
    .lt("updated_at", hoursAgo(cfg.firstAfterHours))
    .gt("updated_at", hoursAgo(24 * 14)) // don't dig up old baskets
    .not("email", "is", null)
    .limit(200);

  const { data: optouts } = await db.from("email_optouts").select("email");
  const blocked = new Set((optouts ?? []).map((o) => o.email));
  const emails: Email[] = [];
  const touched: { id: string; reminders: number }[] = [];

  for (const b of due ?? []) {
    const email = (b.email as string).toLowerCase();
    const items = (b.items as { label: string; qty: number; pricePence: number }[]) ?? [];
    if (!items.length || blocked.has(email)) continue;
    const second = b.reminders === 1 && cfg.secondAfterHours > 0 && b.last_reminded_at && Date.parse(b.last_reminded_at) < now - (cfg.secondAfterHours - cfg.firstAfterHours) * 3600_000;
    if (!(b.reminders === 0 || second)) continue;

    // bought since? (another device, or straight through Stripe)
    const { count } = await db.from("orders").select("id", { count: "exact", head: true }).eq("email", email).gt("created_at", b.updated_at);
    if (count) { await db.from("baskets").update({ status: "recovered" }).eq("id", b.id); continue; }

    const list = items.map((i) => `${i.qty > 1 ? `${i.qty} × ` : ""}${i.label}${i.pricePence ? ` — ${money(i.pricePence * i.qty)}` : ""}`).join("\n");
    const href = b.recovery_url ?? (b.member_id ? "/members/basket" : "/basket");
    const unsub = unsubscribeUrl(email);
    const { html, text } = brandEmail({
      eyebrow: second ? "Last call" : "Your basket",
      title: `${b.first_name ? `${b.first_name}, you` : "You"} left something behind`,
      body: `${cfg.intro}\n\n${list}${b.total_pence ? `\n\nTotal ${money(b.total_pence)} plus delivery` : ""}`,
      button: { label: "Back to my basket", href },
      unsubscribe: unsub,
    });
    emails.push({ to: email, subject: second ? `Last call: ${cfg.subject.toLowerCase()}` : cfg.subject, html, text, unsubscribeUrl: unsub });
    touched.push({ id: b.id, reminders: b.reminders + 1 });
  }

  const result = await sendEmails(emails);
  if (result.sent) {
    const stamp = new Date().toISOString();
    for (const t of touched.slice(0, result.sent)) await db.from("baskets").update({ status: "reminded", reminders: t.reminders, last_reminded_at: stamp }).eq("id", t.id);
  }
  return NextResponse.json({ checked: due?.length ?? 0, sent: result.sent, error: result.error });
}
