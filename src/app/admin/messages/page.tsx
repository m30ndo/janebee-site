import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";
import { AUDIENCES, kindOf } from "@/lib/messages";
import { normaliseBasketSettings } from "@/lib/basket-reminders";
import { emailConfigured } from "@/lib/email";
import { pushConfigured } from "@/lib/push";
import { Field, Notice, PageHead, Section, inputCls } from "@/components/admin/ui";
import { saveBasketReminders } from "./actions";

const money = (p: number) => `£${(p / 100).toFixed(2)}`;

export default async function MessagesAdmin({ searchParams }: PageProps<"/admin/messages">) {
  const supabase = await serverClient();
  const [{ data: messages }, { data: baskets }, { data: setting }, { count: pushCount }] = await Promise.all([
    supabase.from("member_messages").select("id, kind, title, audience, channels, status, sent_at, updated_at, stats").order("updated_at", { ascending: false }).limit(50),
    supabase.from("baskets").select("id, email, first_name, items, total_pence, status, reminders, updated_at").neq("status", "emptied").order("updated_at", { ascending: false }).limit(30),
    supabase.from("site_settings").select("value").eq("key", "basket_reminders").maybeSingle(),
    supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
  ]);
  const cfg = normaliseBasketSettings(setting?.value);
  const recovered = (baskets ?? []).filter((b) => b.status === "recovered").length;

  return (
    <>
      <PageHead title="Messages" action={{ href: "/admin/messages/new", label: "+ New message" }}>
        Tell members about a new piece, a gallery viewing or an event: app inbox, email and phone notifications in one go.
      </PageHead>
      <Notice searchParams={await searchParams} />

      <SetupStatus email={emailConfigured()} push={pushConfigured()} pushCount={pushCount ?? 0} />

      <ul className="mb-14 space-y-3">
        {(messages ?? []).map((m) => {
          const s = (m.stats ?? {}) as Record<string, number | string>;
          return (
            <li key={m.id}>
              <Link href={`/admin/messages/${m.id}`} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 hover:ring-honey/60">
                <span className="w-28 shrink-0 text-[10px] tracking-[0.2em] text-honey uppercase">{kindOf(m.kind).label}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-h2 text-xl">{m.title}</span>
                  <span className="text-xs opacity-60">
                    {AUDIENCES.find((a) => a.key === m.audience)?.label} · {m.channels.join(", ")}
                    {m.status === "sent" && ` · ${[s.emails != null && `${s.emails} emails`, s.notifications != null && `${s.notifications} notifications`].filter(Boolean).join(", ")}`}
                  </span>
                </span>
                <span className={`rounded-full px-3 py-1 text-xs ${m.status === "sent" ? "bg-honey/15 text-honey" : "bg-white/10 text-white/70"}`}>
                  {m.status === "sent" ? `Sent ${formatUk(m.sent_at, false)}` : m.status === "sending" ? "Sending…" : "Draft"}
                </span>
              </Link>
            </li>
          );
        })}
        {!messages?.length && <li className="rounded-2xl bg-white/[0.04] p-5 text-sm opacity-60 ring-1 ring-white/10">No messages yet. The first one is the fun one.</li>}
      </ul>

      <h2 id="baskets" className="mb-2 scroll-mt-6 font-h2 text-3xl font-light">Basket reminders</h2>
      <p className="mb-6 max-w-2xl text-sm text-white/60">
        When someone adds work to their basket and leaves without buying, they get a friendly nudge. Members are covered automatically; guests only if they ticked &ldquo;keep me updated&rdquo; at checkout. Never more than two emails, and never after they&apos;ve bought.
      </p>
      <form action={saveBasketReminders}>
        <Section title="Settings">
          <label className="flex items-center gap-3 md:col-span-2">
            <input type="checkbox" name="enabled" defaultChecked={cfg.enabled} className="h-5 w-5 accent-[#e3a21a]" />
            <span>Send basket reminders</span>
          </label>
          <Field label="First email after (hours)"><input type="number" name="firstAfterHours" min={1} max={72} defaultValue={cfg.firstAfterHours} className={inputCls} /></Field>
          <Field label="Last nudge after (hours)" hint="0 = only send one email"><input type="number" name="secondAfterHours" min={0} max={168} defaultValue={cfg.secondAfterHours} className={inputCls} /></Field>
          <Field label="Subject line" wide><input name="subject" defaultValue={cfg.subject} className={inputCls} /></Field>
          <Field label="Opening words" wide hint="Their basket and a button back to it are added underneath."><textarea name="intro" rows={3} defaultValue={cfg.intro} className={inputCls} /></Field>
          <div className="md:col-span-2"><button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save reminder settings</button></div>
        </Section>
      </form>

      <div className="mb-14 overflow-x-auto rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
        <p className="border-b border-white/10 px-4 py-3 text-xs text-white/60">
          Recent baskets · <span className="text-honey">{recovered} bought after all</span>
        </p>
        <table className="w-full text-sm">
          <tbody>
            {(baskets ?? []).map((b) => (
              <tr key={b.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">{b.first_name ?? ""} <span className="opacity-60">{b.email}</span></td>
                <td className="px-4 py-3 opacity-80">{(b.items as { label: string }[]).map((i) => i.label).join(", ") || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{b.total_pence ? money(b.total_pence) : ""}</td>
                <td className="px-4 py-3 whitespace-nowrap capitalize opacity-80">{b.status}{b.reminders ? ` · ${b.reminders} sent` : ""}</td>
                <td className="px-4 py-3 whitespace-nowrap opacity-60">{formatUk(b.updated_at, false)}</td>
              </tr>
            ))}
            {!baskets?.length && <tr><td className="px-4 py-4 opacity-60">No baskets yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 font-h2 text-3xl font-light">WhatsApp</h2>
      <div className="rounded-2xl border border-dashed border-white/20 p-5 text-sm leading-relaxed text-white/70">
        <p>
          WhatsApp messages need a WhatsApp Business account with Meta: a verified business, a phone number just for it, and each message
          pre-approved as a template. Meta charges per message. Once that&apos;s set up it slots in here as a fourth channel, and members opt in with their number in the app.
        </p>
        <p className="mt-3 text-honey">Not switched on yet.</p>
      </div>
    </>
  );
}

function SetupStatus({ email, push, pushCount }: { email: boolean; push: boolean; pushCount: number }) {
  const row = (ok: boolean, label: string, fix: string) => (
    <li className="flex items-start gap-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ok ? "bg-honey" : "bg-[#ff7a66]"}`} />
      <span><span className="text-white">{label}</span>{!ok && <span className="block text-xs text-white/50">{fix}</span>}</span>
    </li>
  );
  return (
    <ul className="mb-8 grid gap-3 rounded-2xl bg-white/[0.03] p-5 text-sm ring-1 ring-white/10 md:grid-cols-3">
      {row(true, "App inbox: ready", "")}
      {row(email, email ? "Email: ready" : "Email: not set up", "Add RESEND_API_KEY and EMAIL_FROM in Vercel.")}
      {row(push, push ? `Phone notifications: ready · ${pushCount} phones` : "Phone notifications: not set up", "Add the VAPID keys in Vercel.")}
    </ul>
  );
}
