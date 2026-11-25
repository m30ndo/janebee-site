import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { normaliseFriends, type Friend } from "@/lib/friends";
import { normaliseShopCarousel, type ShopCarousel } from "@/lib/shop-carousel";
import { DEFAULT_SIZES, DEFAULT_TYPOGRAPHY, normaliseSizes, normaliseTypography, type TypeSizes, type Typography } from "@/lib/typography";

/** Site-wide typography: fonts and sizes (Studio → Settings). Cached; saving in Studio refreshes it. */
export async function getTypography(): Promise<{ fonts: Typography; sizes: TypeSizes }> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { fonts: DEFAULT_TYPOGRAPHY, sizes: DEFAULT_SIZES };
  const { data } = await publicClient().from("site_settings").select("value").eq("key", "typography").maybeSingle();
  return { fonts: normaliseTypography(data?.value), sizes: normaliseSizes(data?.value) };
}

/** Friends of the Hive (Studio → Friends). Cached; saving in Studio refreshes it. */
export async function getFriends(): Promise<Friend[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const { data } = await publicClient().from("site_settings").select("value").eq("key", "friends").maybeSingle();
  return normaliseFriends(data?.value);
}

/** The shop's 3D carousel (Studio → Shop carousel). Cached; saving in Studio refreshes it. */
export async function getShopCarousel(): Promise<ShopCarousel> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return normaliseShopCarousel(null);
  const { data } = await publicClient().from("site_settings").select("value").eq("key", "shop_carousel").maybeSingle();
  return normaliseShopCarousel(data?.value);
}
