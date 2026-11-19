import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient, imageUrl } from "@/lib/supabase/public";

/** Single images placed on website pages, set in Studio → About page. */
export const SITE_IMAGES = [
  { key: "about-portrait", label: "Portrait of Jane (About page)", hint: "A portrait photo works best (taller than wide, at least 1200px tall). It's shown in a 4:5 frame." },
] as const;

export type SiteImage = { image: string | null; focus: string };

export async function getSiteImages(): Promise<Record<string, SiteImage>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("site-images");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return {};
  const { data } = await publicClient().from("site_images").select("key, image_path, focus");
  return Object.fromEntries((data ?? []).map((r) => [r.key, { image: imageUrl(r.image_path), focus: r.focus || "center" }]));
}
