"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { DEFAULT_SIZES, DEFAULT_TYPOGRAPHY, SIZE_SLOTS, SLOTS, normaliseSizes, normaliseTypography } from "@/lib/typography";

export async function saveTypography(data: FormData) {
  await requireSuperAdmin();
  const value = data.get("reset")
    ? { ...DEFAULT_TYPOGRAPHY, sizes: DEFAULT_SIZES }
    : {
        ...normaliseTypography(Object.fromEntries(SLOTS.map((s) => [s.key, String(data.get(s.key) ?? "")]))),
        sizes: normaliseSizes({ sizes: Object.fromEntries(SIZE_SLOTS.map((k) => [k, { phone: data.get(`${k}_phone`), desktop: data.get(`${k}_desktop`) }])) }),
      };
  const supabase = await serverClient();
  const { error } = await supabase.from("site_settings").upsert({ key: "typography", value, updated_at: new Date().toISOString() });
  if (error) redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  updateTag("settings");
  redirect("/admin/settings?saved=1");
}
