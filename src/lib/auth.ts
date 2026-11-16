import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string;
  firstName: string | null;
  role: "member" | "admin";
};

/** The signed-in visitor, or null. Request-time: call inside a Suspense boundary. */
export async function getViewer(): Promise<Viewer | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await serverClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", data.user.id)
    .maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    firstName: profile?.first_name ?? null,
    role: profile?.role === "admin" ? "admin" : "member",
  };
}

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
