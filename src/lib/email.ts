import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sends email through Resend (https://resend.com) — plain fetch, no SDK.
 * Needs RESEND_API_KEY and EMAIL_FROM (e.g. "Jane Bee <hello@janebee.co.uk>",
 * on a domain verified in Resend). Without them nothing is sent.
 */

export type Email = { to: string; subject: string; html: string; text: string; unsubscribeUrl?: string };

export const emailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

const site = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function payload(e: Email) {
  return {
    from: process.env.EMAIL_FROM,
    to: [e.to],
    subject: e.subject,
    html: e.html,
    text: e.text,
    ...(e.unsubscribeUrl
      ? { headers: { "List-Unsubscribe": `<${e.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }
      : {}),
  };
}

/** Sends up to 100 emails per request (Resend batch). Returns how many were accepted. */
export async function sendEmails(emails: Email[]): Promise<{ sent: number; error?: string }> {
  if (!emailConfigured()) return { sent: 0, error: "Email isn't set up yet (RESEND_API_KEY / EMAIL_FROM)." };
  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100);
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(chunk.map(payload)),
    });
    if (!res.ok) return { sent, error: `Email provider said ${res.status}: ${(await res.text()).slice(0, 200)}` };
    sent += chunk.length;
  }
  return { sent };
}

/* ---------------------------------------------------------------- unsubscribe links */

const secret = () => process.env.EMAIL_LINK_SECRET || process.env.CRON_SECRET || "";

export function unsubscribeToken(email: string) {
  return createHmac("sha256", secret()).update(email.toLowerCase()).digest("base64url").slice(0, 32);
}

export function checkUnsubscribeToken(email: string, token: string) {
  if (!secret()) return false;
  const a = Buffer.from(unsubscribeToken(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const unsubscribeUrl = (email: string) =>
  `${site()}/api/unsubscribe?e=${encodeURIComponent(email.toLowerCase())}&t=${unsubscribeToken(email)}`;

/* ---------------------------------------------------------------- the house template */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Black, honey and white, like the site. Body is plain text (blank line = paragraph). */
export function brandEmail({ eyebrow, title, body, image, button, unsubscribe }: {
  eyebrow: string; title: string; body: string; image?: string | null; button?: { label: string; href: string } | null; unsubscribe?: string;
}): { html: string; text: string } {
  const paras = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const href = button ? (button.href.startsWith("/") ? site() + button.href : button.href) : null;
  const html = `<!doctype html><html><body style="margin:0;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding-bottom:24px"><img src="${site()}/icons/icon-192.png" width="48" height="48" alt="Jane Bee" style="display:block;border:0"></td></tr>
<tr><td style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#ee3f8c;padding-bottom:10px">${esc(eyebrow)}</td></tr>
<tr><td style="font-family:Georgia,serif;font-size:34px;line-height:1.1;font-weight:300;padding-bottom:20px">${esc(title)}</td></tr>
${image ? `<tr><td style="padding-bottom:20px"><img src="${esc(image)}" width="560" alt="" style="display:block;width:100%;height:auto;border:0"></td></tr>` : ""}
${paras.map((p) => `<tr><td style="font-size:16px;line-height:1.6;color:#e6e6e6;padding-bottom:14px">${esc(p).replace(/\n/g, "<br>")}</td></tr>`).join("")}
${href ? `<tr><td style="padding:14px 0 28px"><a href="${esc(href)}" style="display:inline-block;background:#ee3f8c;color:#000;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:3px;text-transform:uppercase;padding:16px 28px">${esc(button!.label)}</a></td></tr>` : ""}
<tr><td style="border-top:1px solid #333;padding-top:18px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#939598">Raw · Honest · Playful · <s>Slightly</s> Very naughty</td></tr>
${unsubscribe ? `<tr><td style="padding-top:12px;font-size:12px;color:#777">Don't want these? <a href="${esc(unsubscribe)}" style="color:#939598">Unsubscribe</a>.</td></tr>` : ""}
</table></td></tr></table></body></html>`;
  const text = [eyebrow.toUpperCase(), "", title, "", ...paras.flatMap((p) => [p, ""]), href ? `${button!.label}: ${href}` : "", unsubscribe ? `\nUnsubscribe: ${unsubscribe}` : ""].join("\n");
  return { html, text };
}
