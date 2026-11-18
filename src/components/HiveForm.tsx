"use client";

import { useActionState } from "react";
import { joinHive, type FormState } from "@/app/actions";

const initial: FormState = { status: "idle", message: "" };

export function HiveForm({ source = "site", onYellow = false }: { source?: string; onYellow?: boolean }) {
  const [state, action, pending] = useActionState(joinHive, initial);

  if (state.status === "ok") return <p className="font-serif text-2xl italic">{state.message}</p>;

  return (
    <form action={action} className="max-w-md">
      <input type="hidden" name="source" value={source} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />
      <div className="flex border-b border-current">
        <label className="sr-only" htmlFor="hive-email">Email address</label>
        <input
          id="hive-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className={`min-w-0 flex-1 bg-transparent py-3 outline-none ${onYellow ? "placeholder:text-black/60" : "placeholder:opacity-60"}`}
        />
        <button disabled={pending} className={`py-3 pl-4 font-medium whitespace-nowrap disabled:opacity-50 ${onYellow ? "hover:text-white" : "hover:text-honey"}`}>
          {pending ? "Adding…" : "Join the Hive →"}
        </button>
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm opacity-80">
        <input type="checkbox" name="consent" className={`mt-1 ${onYellow ? "accent-black" : "accent-honey"}`} />
        <span>I&apos;m happy to receive emails from Jane Bee. Unsubscribe any time.</span>
      </label>
      {state.status === "error" && <p className={`mt-3 text-sm ${onYellow ? "font-medium" : "text-[#e8826e]"}`}>{state.message}</p>}
    </form>
  );
}
