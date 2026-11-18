import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient, imageUrl } from "@/lib/supabase/public";

/** Pages that can have a full-bleed background image (set in Studio → Backgrounds). */
export const BACKGROUND_PAGES = [
  { key: "home", label: "Website home" },
  { key: "shop", label: "Shop" },
  { key: "journal", label: "Journal" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "the-hive", label: "Join the Hive page" },
  { key: "app-signin", label: "App sign-in" },
  { key: "app-home", label: "App home" },
] as const;

export type BackgroundPage = (typeof BACKGROUND_PAGES)[number]["key"];
export type Background = { page: string; imagePath: string | null; image: string | null; overlay: number };

/** All page backgrounds. Cached; Studio saves refresh it. */
export async function getBackgrounds(): Promise<Record<string, Background>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("backgrounds");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return {};
  const { data } = await publicClient().from("page_backgrounds").select("page, image_path, overlay");
  return Object.fromEntries(
    (data ?? []).map((r) => [r.page, { page: r.page, imagePath: r.image_path, image: imageUrl(r.image_path), overlay: r.overlay ?? 60 }]),
  );
}
