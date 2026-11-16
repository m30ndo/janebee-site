"use client";

import { useActionState } from "react";
import { sendEnquiry, type FormState } from "@/app/actions";

const initial: FormState = { status: "idle", message: "" };

export function EnquiryForm({
  paintingId,
  kind = "general",
  defaultMessage = "",
  tone = "dark",
}: {
  paintingId?: string;
  kind?: "general" | "commission" | "piece";
  defaultMessage?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const field = `w-full border-b bg-transparent py-2 outline-none focus:border-honey ${dark ? "border-white/30 text-white" : "border-espresso/40"}`;
  const [state, action, pending] = useActionState(sendEnquiry, initial);

  if (state.status === "ok") return <p className={`py-4 font-serif text-xl italic ${dark ? "text-honey" : ""}`}>{state.message}</p>;

  return (
    <form action={action} className="space-y-4" id="enquire">
      <input type="hidden" name="kind" value={kind} />
      {paintingId && <input type="hidden" name="painting_id" value={paintingId} />}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />
      <label className={`block text-xs tracking-[0.15em] uppercase ${dark ? "text-honey" : ""}`}>
        Name
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className={`block text-xs tracking-[0.15em] uppercase ${dark ? "text-honey" : ""}`}>
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className={`block text-xs tracking-[0.15em] uppercase ${dark ? "text-honey" : ""}`}>
        Message
        <textarea name="message" required rows={4} defaultValue={defaultMessage} className={`${field} resize-y normal-case tracking-normal`} />
      </label>
      <button disabled={pending} className={`w-full rounded-full py-3 font-medium disabled:opacity-60 ${dark ? "bg-honey text-black hover:bg-white" : "bg-espresso text-cream hover:bg-honey hover:text-espresso"}`}>
        {pending ? "Sending…" : "Send enquiry"}
      </button>
      {state.status === "error" && <p className="text-sm text-[#a3402d]">{state.message}</p>}
    </form>
  );
}
