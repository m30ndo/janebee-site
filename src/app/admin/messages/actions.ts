"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminClient, serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { AUDIENCES, CHANNELS, MESSAGE_KINDS, kindOf, type Audience } from "@/lib/messages";
import { brandEmail, sendEmails, unsubscribeUrl, type Email } from "@/lib/email";
import { sendPush } from "@/lib/push";
import { normaliseBasketSettings } from "@/lib/basket-reminders";

const str = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

function readMessage(d: FormData) {
  const kind = MESSAGE_KINDS.some((k) => k.key === str(d, "kind")) ? str(d, "kind") : "news";
  const audience = AUDIENCES.some((a) => a.key === str(d, "audience")) ? str(d, "audience") : "members";
  const channels = CHANNELS.map((c) => c.key).filter((c) => d.get(`ch_${c}`) === "on");
  const link = str(d, "link_url");
  return {
    kind,
    audience,
    // the newsletter list has no app, so email only
    channels: audience === "hive" ? ["email"] : channels.length ? channels : ["app"],
    title: str(d, "title").slice(0, 140),
    body: str(d, "body").slice(0, 4000),
    link_url: /^(\/|https:\/\/)/.test(link) ? link : null,
    link_label: str(d, "link_label").slice(0, 40) || null,
    image_path: str(d, "image_path") || null,
    updated_at: new Date().toISOString(),
  };
}

export async function saveMessage(d: FormData) {
  const admin = await requireAdmin();
  const id = str(d, "id");
  const row = readMessage(d);
  const back = `/admin/messages/${id || "new"}`;
  if (!row.title) redirect(`${back}?error=${encodeURIComponent("Give the message a title.")}`);
  const supabase = await serverClient();
  const { data, error } = id
    ? await supabase.from("member_messages").update(row).eq("id", id).eq("status", "draft").select("id").single()
    : await supabase.from("member_messages").insert({ ...row, created_by: admin.id }).select("id").single();
  if (error || !data) redirect(`${back}?error=${encodeURIComponent(error?.message ?? "Couldn't save (already sent?)")}`);
  if (d.get("send")) return sendMessage(data.id);
  redirect(`/admin/messages/${data.id}?saved=1`);
}

export async function deleteMessage(d: FormData) {
  await requireAdmin();
  const supabase = await serverClient();
  await supabase.from("member_messages").delete().eq("id", str(d, "id"));
  redirect("/admin/messages");
}

type Recipient = { email: string; firstName: string | null };

async function recipients(db: ReturnType<typeof adminClient>, audience: Audience): Promise<Recipient[]> {
  const out = new Map<string, Recipient>();
  if (audience !== "hive") {
    const { data } = await db.from("profiles").select("email, first_name, notify_email");
    for (const p of data ?? []) if (p.email && p.notify_email !== false) out.set(p.email.toLowerCase(), { email: p.email.toLowerCase(), firstName: p.first_name });
  }
  if (audience !== "members") {
    const { data } = await db.from("hive_signups").select("email, first_name").eq("consent", true);
    for (const h of data ?? []) if (h.email && !out.has(h.email.toLowerCase())) out.set(h.email.toLowerCase(), { email: h.email.toLowerCase(), firstName: h.first_name });
  }
  const { data: optouts } = await db.from("email_optouts").select("email");
  for (const o of optouts ?? []) out.delete(o.email);
  return [...out.values()];
}

/** Sends a draft: app inbox (instant), email and phone notifications. */
export async function sendMessage(id: string) {
  await requireAdmin();
  const db = adminClient();
  // claim it, so a double-click can't send twice
  const { data: m } = await db.from("member_messages").update({ status: "sending" }).eq("id", id).eq("status", "draft").select("*").maybeSingle();
  if (!m) redirect(`/admin/messages/${id}?error=${encodeURIComponent("Already sent.")}`);

  const k = kindOf(m.kind);
  const stats: Record<string, number | string> = {};
  const button = m.link_url ? { label: m.link_label || k.button, href: m.link_url } : null;

  if (m.channels.includes("email")) {
    const people = await recipients(db, m.audience as Audience);
    const emails: Email[] = people.map((p) => {
      const unsub = unsubscribeUrl(p.email);
      const { html, text } = brandEmail({
        eyebrow: k.eyebrow,
        title: m.title,
        body: `${p.firstName ? `Hi ${p.firstName},\n\n` : ""}${m.body}`,
        image: imageUrl(m.image_path),
        button,
        unsubscribe: unsub,
      });
      return { to: p.email, subject: m.title, html, text, unsubscribeUrl: unsub };
    });
    const r = await sendEmails(emails);
    stats.emails = r.sent;
    if (r.error) stats.email_error = r.error;
  }

  if (m.channels.includes("push") && m.audience !== "hive") {
    const { data: subs } = await db.from("push_subscriptions").select("endpoint, p256dh, auth");
    const r = await sendPush(subs ?? [], { title: m.title, body: m.body.slice(0, 160), url: m.link_url?.startsWith("/members") ? m.link_url : "/members/inbox" });
    stats.notifications = r.sent;
    if (r.gone.length) await db.from("push_subscriptions").delete().in("endpoint", r.gone);
  }

  if (m.channels.includes("app")) {
    const { count } = await db.from("profiles").select("id", { count: "exact", head: true });
    stats.inbox = count ?? 0;
  }

  await db.from("member_messages").update({ status: "sent", sent_at: new Date().toISOString(), stats }).eq("id", id);
  redirect(`/admin/messages/${id}?sent=1`);
}

export async function saveBasketReminders(d: FormData) {
  await requireAdmin();
  const value = normaliseBasketSettings({
    enabled: d.get("enabled") === "on",
    firstAfterHours: Number(d.get("firstAfterHours")),
    secondAfterHours: Number(d.get("secondAfterHours")),
    subject: str(d, "subject"),
    intro: str(d, "intro"),
  });
  const supabase = await serverClient();
  const { error } = await supabase.from("site_settings").upsert({ key: "basket_reminders", value, updated_at: new Date().toISOString() });
  redirect(`/admin/messages?${error ? `error=${encodeURIComponent(error.message)}` : "saved=1"}#baskets`);
}
