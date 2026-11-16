import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { serverClient } from "@/lib/supabase/server";

/** Email link sign-in: /auth/confirm?token_hash=…&type=email&next=/members (works across devices). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "email") as EmailOtpType;
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/members";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/members";

  const supabase = await serverClient();
  const { error } = tokenHash
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("missing token") };

  if (error) return NextResponse.redirect(new URL("/signin?error=link", url));
  await supabase.rpc("claim_guest_orders");
  return NextResponse.redirect(new URL(next, url));
}
