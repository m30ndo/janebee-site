"use client";

import { useActionState } from "react";
import { sendCode, verifyCode, type SignInState } from "@/app/auth-actions";

const input = "w-full border-b border-current bg-transparent py-3 text-lg outline-none placeholder:opacity-50 focus:border-honey";
const button = "mt-6 w-full rounded-full bg-honey py-4 font-medium text-espresso hover:bg-cream disabled:opacity-60";

export function SignInForm({ next }: { next: string }) {
  const [sent, send, sending] = useActionState(sendCode, { step: "email", email: "", message: "" } as SignInState);
  const [verified, verify, verifying] = useActionState(verifyCode, { step: "code", email: "", message: "" } as SignInState);

  if (sent.step === "code") {
    const msg = verified.message || sent.message;
    const isError = verified.error;
    return (
      <div>
        <form action={verify}>
          <input type="hidden" name="email" value={sent.email} />
          <input type="hidden" name="next" value={next} />
          <label className="block text-xs tracking-[0.2em] uppercase opacity-70" htmlFor="code">6-digit code</label>
          <input
            id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={8}
            autoFocus required placeholder="••••••" className={`${input} tracking-[0.5em]`}
          />
          <button disabled={verifying} className={button}>{verifying ? "Checking…" : "Sign in"}</button>
        </form>
        <p className={`mt-4 text-sm ${isError ? "text-[#e8826e]" : "opacity-75"}`}>{msg}</p>
        <form action={send} className="mt-2">
          <input type="hidden" name="email" value={sent.email} />
          <input type="hidden" name="next" value={next} />
          <button className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100">Resend code</button>
        </form>
      </div>
    );
  }

  return (
    <form action={send}>
      <input type="hidden" name="next" value={next} />
      <label className="block text-xs tracking-[0.2em] uppercase opacity-70" htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required defaultValue={sent.email} placeholder="you@example.com" className={input} />
      <button disabled={sending} className={button}>{sending ? "Sending…" : "Email me a sign-in code"}</button>
      {sent.message && <p className="mt-4 text-sm text-[#e8826e]">{sent.message}</p>}
      <p className="mt-6 text-xs leading-relaxed opacity-60">
        No password needed. New here? Signing in makes you a member of the Hive, with early access to new work, prints and invitations.
      </p>
    </form>
  );
}
