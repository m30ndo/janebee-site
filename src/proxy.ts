import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * 1. Private preview gate: while SITE_PASSWORD is set, every page asks for a
 *    password (HTTP Basic Auth, any username). Remove the env var on launch day.
 * 2. Keeps the member's Supabase session fresh.
 */
export async function proxy(request: NextRequest) {
  const gate = passwordGate(request);
  if (gate) return gate;

  let response = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.getClaims(); // refreshes an expiring session
  return response;
}

function passwordGate(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  // Stripe and other machine callers can't send a password
  if (request.nextUrl.pathname.startsWith("/api/stripe/")) return null;

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      if (decoded.slice(decoded.indexOf(":") + 1) === password) return null;
    } catch {
      // fall through
    }
  }
  return new NextResponse("Jane Bee — private preview", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Jane Bee preview", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|offline.html|art/).*)"],
};
