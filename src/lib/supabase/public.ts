import { createClient } from "@supabase/supabase-js";

/**
 * Session-less client: returns only what the public can see (RLS enforces
 * release dates). Safe to use inside "use cache" functions.
 * Member early access will use a cookie-aware client (see ./server.ts, phase 3).
 */
export function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Image paths starting with "/" are bundled samples; anything else lives in the "artwork" bucket. */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${path}`;
}
