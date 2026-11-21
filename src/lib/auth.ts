import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string;
  firstName: string | null;
  role: "member" | "admin";
  /** Distinktive Design: can change site-wide settings such as typography */
  superAdmin: boolean;
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
    .select("first_name, role, super_admin")
    .eq("id", claims.sub)
    .maybeSingle();
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    firstName: profile?.first_name ?? null,
    role: profile?.role === "admin" ? "admin" : "member",
    superAdmin: profile?.role === "admin" && profile?.super_admin === true,
  };
});

export async function requireMember(next = "/members"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return viewer;
}

/** Studio (CRM) only: anyone else is sent to the Studio sign-in, never into the members app. */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "admin") redirect("/studio");
  return viewer;
}

/** Super admins only (site-wide settings). Other admins are sent back to the Studio overview. */
export async function requireSuperAdmin(): Promise<Viewer> {
  const viewer = await requireAdmin();
  if (!viewer.superAdmin) redirect("/admin?error=" + encodeURIComponent("Only a super admin can change that."));
  return viewer;
}
