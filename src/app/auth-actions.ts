"use server";

import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export type AuthState = { message: string; error?: boolean };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const safeNext = (n: unknown) => {
  const s = String(n ?? "/members");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/members";
};

export async function signIn(_prev: AuthState, data: FormData): Promise<AuthState> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const password = String(data.get("password") ?? "");
  if (!EMAIL.test(email) || !password) return { message: "Enter your email and password.", error: true };

  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      message: /confirm/i.test(error.message) ? "Please confirm your email first." : "That email and password don't match. Try again or reset your password.",
      error: true,
    };
  }
  await supabase.rpc("claim_guest_orders");
  redirect(safeNext(data.get("next")));
}

export async function signUp(_prev: AuthState, data: FormData): Promise<AuthState> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const password = String(data.get("password") ?? "");
  const firstName = String(data.get("first_name") ?? "").trim().slice(0, 80);
  if (!EMAIL.test(email)) return { message: "Please enter a valid email address.", error: true };
  if (password.length < 8) return { message: "Choose a password of at least 8 characters.", error: true };

  const supabase = await serverClient();
  const { data: res, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName } } });
  if (error) {
    return {
      message: /registered|exists/i.test(error.message) ? "You already have an account — sign in instead." : /weak|pwned|leaked/i.test(error.message) ? "That password is too easy to guess. Try another." : error.message,
      error: true,
    };
  }
  if (!res.session) return { message: "Account created. Check your email to confirm, then sign in." };
  await supabase.rpc("claim_guest_orders");
  redirect(safeNext(data.get("next")));
}

/** Forgotten password: emails a link that signs them in and lets them choose a new one. */
export async function requestReset(_prev: AuthState, data: FormData): Promise<AuthState> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { message: "Enter your email address above first.", error: true };
  const supabase = await serverClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site}/auth/confirm?next=/members/account?reset=1` });
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function changePassword(_prev: AuthState, data: FormData): Promise<AuthState> {
  const password = String(data.get("password") ?? "");
  if (password.length < 8) return { message: "Use at least 8 characters.", error: true };
  const supabase = await serverClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { message: /weak|pwned|leaked/i.test(error.message) ? "That password is too easy to guess." : error.message, error: true };
  return { message: "Password updated." };
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
