"use client";

import { useActionState } from "react";
import { changePassword, type AuthState } from "@/app/auth-actions";

export function PasswordForm({ highlight }: { highlight?: boolean }) {
  const [state, action, pending] = useActionState(changePassword, { message: "" } as AuthState);
  return (
    <form action={action} id="password" className={`mt-4 rounded-2xl p-5 ${highlight ? "bg-honey text-espresso" : "bg-cream/[0.06]"}`}>
      <label className="block text-xs tracking-[0.2em] uppercase opacity-70" htmlFor="new_password">
        {highlight ? "Choose a new password" : "Change password"}
      </label>
      <input
        id="new_password" name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="At least 8 characters"
        className="mt-2 w-full border-b border-current/40 bg-transparent py-2 text-lg outline-none placeholder:opacity-40"
      />
      <button disabled={pending} className={`btn-sheen mt-4 rounded-full px-5 py-2.5 text-sm font-medium ${highlight ? "bg-espresso text-cream" : "bg-cream text-espresso"}`}>
        {pending ? "Saving…" : "Save password"}
      </button>
      {state.message && <p className="mt-3 text-sm">{state.message}</p>}
    </form>
  );
}
