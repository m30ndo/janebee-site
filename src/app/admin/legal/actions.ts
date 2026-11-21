"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { LEGAL_DEFAULTS } from "@/lib/legal";

export async function saveLegal(data: FormData) {
  await requireAdmin();
  const slug = String(data.get("slug") ?? "");
  const back = `/admin/legal/${slug}`;
  const def = LEGAL_DEFAULTS.find((p) => p.slug === slug);
  if (!def) redirect("/admin/legal?error=Unknown%20page");
  const reset = !!data.get("reset");
  const title = reset ? def.title : String(data.get("title") ?? "").trim().slice(0, 120);
  const body = reset ? def.body : String(data.get("body") ?? "").trim();
  if (!title || !body) redirect(`${back}?error=${encodeURIComponent("The page needs a title and some text.")}`);
  const supabase = await serverClient();
  const { error } = await supabase.from("legal_pages").upsert({
    slug, title, body, sort_order: LEGAL_DEFAULTS.indexOf(def), updated_at: new Date().toISOString(),
  });
  if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  updateTag("legal");
  redirect(`${back}?saved=1`);
}
