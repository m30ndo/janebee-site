import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatUk } from "@/lib/dates";
import { AUDIENCES, CHANNELS, MESSAGE_KINDS, kindOf } from "@/lib/messages";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Field, Notice, PageHead, Section, inputCls } from "@/components/admin/ui";
import { SendButton } from "@/components/admin/SendButton";
import { deleteMessage, saveMessage } from "../actions";

export default async function MessageEdit({ params, searchParams }: PageProps<"/admin/messages/[id]">) {
  const { id } = await params;
  const q = await searchParams;
  const supabase = await serverClient();
  const { data: m } = id === "new" ? { data: null } : await supabase.from("member_messages").select("*").eq("id", id).maybeSingle();
  if (id !== "new" && !m) notFound();
  const sent = m && m.status !== "draft";
  const stats = (m?.stats ?? {}) as Record<string, number | string>;

  return (
    <>
      <Link href="/admin/messages" className="text-sm text-white/60 hover:text-white">← Messages</Link>
      <PageHead title={m?.title ?? "New message"}>
        {sent ? `Sent ${formatUk(m.sent_at, true)}.` : "Write it, check it, send it. Saving keeps it as a draft."}
      </PageHead>
      {q.sent && <p className="mb-6 rounded-xl border border-honey/40 bg-honey/10 px-4 py-3 text-sm text-honey">Sent. It&apos;s in the app inbox now{stats.emails != null ? `, ${stats.emails} emails went out` : ""}{stats.notifications != null ? ` and ${stats.notifications} phones buzzed` : ""}.</p>}
      {stats.email_error && <p className="mb-6 rounded-xl border border-[#ff7a66]/40 bg-[#ff7a66]/10 px-4 py-3 text-sm text-[#ffb3a6]">Email: {String(stats.email_error)}</p>}
      <Notice searchParams={q} />

      <form action={saveMessage}>
        <input type="hidden" name="id" value={m?.id ?? ""} />
        <fieldset disabled={!!sent}>
          <Section title="What's it about?">
            <div className="flex flex-wrap gap-2 md:col-span-2">
              {MESSAGE_KINDS.map((k) => (
                <label key={k.key} className="cursor-pointer">
                  <input type="radio" name="kind" value={k.key} defaultChecked={(m?.kind ?? "new_work") === k.key} className="peer sr-only" />
                  <span className="block rounded-full border border-white/20 px-4 py-2 text-sm peer-checked:border-honey peer-checked:bg-honey peer-checked:text-black">{k.label}</span>
                </label>
              ))}
            </div>
            <Field label="Title" wide hint="Also the email subject and the notification headline."><input name="title" required maxLength={140} defaultValue={m?.title ?? ""} className={inputCls} placeholder="A new one's just come off the easel" /></Field>
            <Field label="Message" wide hint="Blank line = new paragraph. Keep it short and in Jane's voice."><textarea name="body" rows={7} maxLength={4000} defaultValue={m?.body ?? ""} className={inputCls} /></Field>
            <Field label="Button link" hint="e.g. /members/work/the-slug, /members/events, or a full https:// address"><input name="link_url" defaultValue={m?.link_url ?? ""} className={inputCls} placeholder="/members/events" /></Field>
            <Field label="Button words" hint={`Leave empty for "${kindOf(m?.kind ?? "new_work").button}"`}><input name="link_label" maxLength={40} defaultValue={m?.link_label ?? ""} className={inputCls} /></Field>
            <div className="md:col-span-2"><ImageUpload folder="messages" initialPath={m?.image_path} initialUrl={imageUrl(m?.image_path)} hint="Optional picture for the email and inbox (the new piece, the venue…)." /></div>
          </Section>

          <Section title="Who and how">
            <div className="space-y-2">
              {AUDIENCES.map((a) => (
                <label key={a.key} className="flex cursor-pointer items-start gap-3">
                  <input type="radio" name="audience" value={a.key} defaultChecked={(m?.audience ?? "members") === a.key} className="mt-1 accent-[#ee3f8c]" />
                  <span><span className="block">{a.label}</span><span className="text-xs text-white/50">{a.hint}</span></span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              {CHANNELS.map((c) => (
                <label key={c.key} className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" name={`ch_${c.key}`} defaultChecked={m ? m.channels.includes(c.key) : true} className="mt-1 accent-[#ee3f8c]" />
                  <span><span className="block">{c.label}</span><span className="text-xs text-white/50">{c.hint}</span></span>
                </label>
              ))}
              <p className="pt-1 text-xs text-white/40">WhatsApp: not set up yet (see Messages).</p>
            </div>
          </Section>
        </fieldset>

        {!sent && (
          <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-white/30 px-6 py-3 font-medium hover:border-honey hover:text-honey">Save draft</button>
              <SendButton />
            </div>
            {m && <DeleteButton action={deleteMessage} what="this draft" />}
          </div>
        )}
      </form>
    </>
  );
}
