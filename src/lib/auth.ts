import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string;
  firstName: string | null;
  role: "member" | "admin";
};

/**
 * The signed-in visitor, or null. Request-time: call inside a Suspense boundary.
 * Verifies the session JWT locally (getClaims) instead of a round trip to the
 * Auth server, and is deduped so a layout and page share one lookup per request.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await serverClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", claims.sub)
    .maybeSingle();
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    firstName: profile?.first_name ?? null,
    role: profile?.role === "admin" ? "admin" : "member",
  };
});

export async function requireMember(next = "/members"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return viewer;
}

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireMember("/admin");
  if (viewer.role !== "admin") redirect("/members");
  return viewer;
}
