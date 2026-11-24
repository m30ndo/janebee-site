import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { normaliseFriends, type Friend } from "@/lib/friends";
import { DEFAULT_TYPOGRAPHY, normaliseTypography, type Typography } from "@/lib/typography";

/** Site-wide typography (Studio → Settings). Cached; saving in Studio refreshes it. */
export async function getTypography(): Promise<Typography> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return DEFAULT_TYPOGRAPHY;
  const { data } = await publicClient().from("site_settings").select("value").eq("key", "typography").maybeSingle();
  return normaliseTypography(data?.value);
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
