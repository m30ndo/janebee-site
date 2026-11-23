import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/server";
import { checkUnsubscribeToken } from "@/lib/email";

/** One-click unsubscribe from reminder and member emails (link in every email). */
async function optOut(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get("e") ?? "").toLowerCase();
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!email || !checkUnsubscribeToken(email, token)) return null;
  const db = adminClient();
  await db.from("email_optouts").upsert({ email, reason: "link" });
  await db.from("baskets").update({ status: "unsubscribed" }).eq("email", email).in("status", ["open", "reminded"]);
  await db.from("hive_signups").update({ consent: false }).eq("email", email);
  return email;
}

export async function POST(request: NextRequest) {
  const done = await optOut(request);
  return done ? NextResponse.json({ ok: true }) : new NextResponse("Bad link", { status: 400 });
}

export async function GET(request: NextRequest) {
  const done = await optOut(request);
  const page = (msg: string) => `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jane Bee</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:Georgia,serif;text-align:center;padding:24px">
<div><p style="font-size:32px;font-weight:300">${msg}</p><p style="font-family:Helvetica,Arial,sans-serif;opacity:.7"><a href="/" style="color:#ee3f8c">Back to the site</a></p></div></body>`;
  return new NextResponse(page(done ? "Done. No more emails from us." : "That link didn't work. Reply to any email and we'll sort it."), {
    status: done ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
