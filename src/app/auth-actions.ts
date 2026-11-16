"use server";

import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export type SignInState = { step: "email" | "code"; email: string; message: string; error?: boolean };

const safeNext = (n: unknown) => {
  const s = String(n ?? "/members");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/members";
};

export async function sendCode(_prev: SignInState, data: FormData): Promise<SignInState> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(data.get("next"));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { step: "email", email, message: "Please enter a valid email address.", error: true };

  const supabase = await serverClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${site}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    const wait = /rate|seconds/i.test(error.message);
    return { step: "email", email, message: wait ? "Too many attempts — please wait a minute and try again." : "We couldn't send your code. Please try again.", error: true };
  }
  return { step: "code", email, message: `We've emailed a 6-digit code to ${email}. It may take a minute.` };
}

export async function verifyCode(_prev: SignInState, data: FormData): Promise<SignInState> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const token = String(data.get("code") ?? "").replace(/\D/g, "");
  const next = safeNext(data.get("next"));
  if (token.length < 6) return { step: "code", email, message: "Enter the code from your email.", error: true };

  const supabase = await serverClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { step: "code", email, message: "That code didn't work or has expired. Try again or resend.", error: true };
  await supabase.rpc("claim_guest_orders");
  redirect(next);
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateName(data: FormData) {
  const supabase = await serverClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/signin");
  const firstName = String(data.get("first_name") ?? "").trim().slice(0, 80) || null;
  await supabase.from("profiles").update({ first_name: firstName }).eq("id", u.user.id);
  redirect("/members/account?saved=1");
}
