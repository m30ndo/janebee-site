"use client";

import { useActionState } from "react";
import { sendEnquiry, type FormState } from "@/app/actions";

const initial: FormState = { status: "idle", message: "" };
const field = "w-full border-b border-espresso/40 bg-transparent py-2 outline-none focus:border-honey";

export function EnquiryForm({
  paintingId,
  kind = "general",
  defaultMessage = "",
}: {
  paintingId?: string;
  kind?: "general" | "commission" | "piece";
  defaultMessage?: string;
}) {
  const [state, action, pending] = useActionState(sendEnquiry, initial);

  if (state.status === "ok") return <p className="py-4 font-serif text-xl italic">{state.message}</p>;

  return (
    <form action={action} className="space-y-4" id="enquire">
      <input type="hidden" name="kind" value={kind} />
      {paintingId && <input type="hidden" name="painting_id" value={paintingId} />}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />
      <label className="block text-xs tracking-[0.15em] uppercase">
        Name
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="block text-xs tracking-[0.15em] uppercase">
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="block text-xs tracking-[0.15em] uppercase">
        Message
        <textarea name="message" required rows={4} defaultValue={defaultMessage} className={`${field} resize-y normal-case tracking-normal`} />
      </label>
      <button disabled={pending} className="w-full rounded-full bg-espresso py-3 font-medium text-cream hover:bg-honey hover:text-espresso disabled:opacity-60">
        {pending ? "Sending…" : "Send enquiry"}
      </button>
      {state.status === "error" && <p className="text-sm text-[#a3402d]">{state.message}</p>}
    </form>
  );
}
