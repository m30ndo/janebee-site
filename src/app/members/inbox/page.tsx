import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { getInbox } from "@/lib/inbox";
import { kindOf } from "@/lib/messages";
import { formatUk } from "@/lib/dates";
import { MarkRead } from "@/components/members/MarkRead";

export const metadata: Metadata = { title: "Inbox" };

export default async function Inbox() {
  const viewer = await requireMember("/members/inbox");
  const messages = await getInbox(viewer.id);
  return (
    <div className="pt-4">
      <header className="animate-rise mb-8 border-b border-white/15 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">Just for the Hive</p>
        <h1 className="mt-2 font-title text-6xl leading-[0.85] font-light tracking-tight">Your <span className="text-honey italic">inbox.</span></h1>
      </header>
      {messages.length === 0 ? (
        <p className="opacity-70">Nothing yet. When Jane has a new piece, a private view or a party, it lands here first.</p>
      ) : (
        <ul className="stagger space-y-4">
          {messages.map((m) => {
            const k = kindOf(m.kind);
            return (
              <li key={m.id} className={`relative overflow-hidden border ${m.read ? "border-white/10" : "border-honey/60"} bg-white/[0.03]`}>
                {!m.read && <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-honey" aria-label="New" />}
                {m.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image} alt="" className="aspect-[16/9] w-full object-cover" />
                )}
                <div className="p-5">
                  <p className="text-[10px] tracking-[0.25em] text-honey uppercase">{k.eyebrow} · {formatUk(m.sentAt, false)}</p>
                  <h2 className="mt-2 font-h2 text-2xl leading-tight">{m.title}</h2>
                  {m.body && <p className="mt-3 text-sm leading-relaxed whitespace-pre-line opacity-80">{m.body}</p>}
                  {m.linkUrl && (
                    <Link href={m.linkUrl} className="mt-5 inline-block bg-honey px-6 py-3 text-xs font-semibold tracking-[0.2em] text-black uppercase">
                      {m.linkLabel || k.button} →
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <MarkRead ids={messages.filter((m) => !m.read).map((m) => m.id)} />
    </div>
  );
}
