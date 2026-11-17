"use client";

import { useActionState, useState } from "react";
import { requestReset, signIn, signUp, type AuthState } from "@/app/auth-actions";

const input = "w-full border-b border-cream/40 bg-transparent py-3 text-lg outline-none placeholder:opacity-40 focus:border-honey transition-colors";
const label = "mt-6 block text-xs tracking-[0.2em] uppercase opacity-70";
const button = "btn-sheen mt-8 w-full rounded-full bg-honey py-4 font-medium text-espresso disabled:opacity-60";
const initial: AuthState = { message: "" };

/** Email + password. One tap to switch between signing in and creating an account. */
export function SignInForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [inState, doIn, signingIn] = useActionState(signIn, initial);
  const [upState, doUp, signingUp] = useActionState(signUp, initial);
  const [resetState, doReset, resetting] = useActionState(requestReset, initial);
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);

  const state = mode === "in" ? inState : upState;

  return (
    <div>
      <div className="relative mb-2 flex bg-cream/10 p-1 text-sm">
        <span className={`absolute inset-y-1 w-[calc(50%-4px)] bg-cream transition-transform duration-300 ${mode === "up" ? "translate-x-full" : ""}`} />
        {(["in", "up"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`relative flex-1 py-2.5 transition-colors ${mode === m ? "text-espresso" : "text-cream/80"}`}>
            {m === "in" ? "Sign in" : "Join the Hive"}
          </button>
        ))}
      </div>

      <form action={mode === "in" ? doIn : doUp} key={mode} className="animate-fade">
        <input type="hidden" name="next" value={next} />
        {mode === "up" && (
          <>
            <label className={label} htmlFor="first_name">First name</label>
            <input id="first_name" name="first_name" autoComplete="given-name" className={input} />
          </>
        )}
        <label className={label} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={input} />
        <label className={label} htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password" name="password" type={show ? "text" : "password"} required minLength={mode === "up" ? 8 : undefined}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            placeholder={mode === "up" ? "At least 8 characters" : ""}
            className={`${input} pr-14`}
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-0 -translate-y-1/2 text-xs tracking-[0.15em] uppercase opacity-60 hover:opacity-100">
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <button disabled={signingIn || signingUp} className={button}>
          {mode === "in" ? (signingIn ? "Signing in…" : "Sign in") : signingUp ? "Creating your account…" : "Create account"}
        </button>
        {state.message && <p className={`mt-4 text-sm ${state.error ? "text-[#f4a08e]" : "opacity-80"}`}>{state.message}</p>}
      </form>

      {mode === "in" && (
        <form action={doReset} className="mt-5">
          <input type="hidden" name="email" value={email} />
          <button disabled={resetting} className="link-draw text-sm opacity-70 hover:opacity-100">Forgotten your password?</button>
          {resetState.message && <p className={`mt-2 text-sm ${resetState.error ? "text-[#f4a08e]" : "opacity-80"}`}>{resetState.message}</p>}
        </form>
      )}
      {mode === "up" && (
        <p className="mt-6 text-xs leading-relaxed opacity-60">
          Joining the Hive gives you early access to new work, prints and invitations. You can leave any time.
        </p>
      )}
    </div>
  );
}
