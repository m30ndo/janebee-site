"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { normaliseHero } from "@/lib/home-hero";

export async function saveHomeHero(data: FormData) {
  await requireAdmin();
  let raw: unknown = null;
  try { raw = JSON.parse(String(data.get("hero") ?? "null")); } catch { raw = null; }
  const supabase = await serverClient();
  const { error } = await supabase.from("site_settings").upsert({ key: "home_hero", value: normaliseHero(raw), updated_at: new Date().toISOString() });
  if (error) redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  updateTag("settings");
  redirect("/admin/hero?saved=1");
}
