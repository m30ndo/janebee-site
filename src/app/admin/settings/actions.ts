"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { DEFAULT_TYPOGRAPHY, SLOTS, normaliseTypography } from "@/lib/typography";

export async function saveTypography(data: FormData) {
  await requireSuperAdmin();
  const value = data.get("reset")
    ? DEFAULT_TYPOGRAPHY
    : normaliseTypography(Object.fromEntries(SLOTS.map((s) => [s.key, String(data.get(s.key) ?? "")])));
  const supabase = await serverClient();
  const { error } = await supabase.from("site_settings").upsert({ key: "typography", value, updated_at: new Date().toISOString() });
  if (error) redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  updateTag("settings");
  redirect("/admin/settings?saved=1");
}
