"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { FRIEND_KINDS, normaliseFriends, type Friend } from "@/lib/friends";

const str = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

async function load() {
  await requireAdmin();
  const supabase = await serverClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "friends").maybeSingle();
  return { supabase, list: normaliseFriends(data?.value) };
}

async function store(supabase: Awaited<ReturnType<typeof serverClient>>, list: Friend[], note = "saved=1") {
  const { error } = await supabase.from("site_settings").upsert({ key: "friends", value: list, updated_at: new Date().toISOString() });
  if (error) redirect(`/admin/friends?error=${encodeURIComponent(error.message)}`);
  updateTag("settings");
  redirect(`/admin/friends?${note}`);
}

export async function saveFriend(data: FormData) {
  const { supabase, list } = await load();
  const id = str(data, "id") || crypto.randomUUID();
  const kind = str(data, "kind");
  const friend: Friend = {
    id,
    kind: FRIEND_KINDS.some((k) => k.value === kind) ? (kind as Friend["kind"]) : "friend",
    name: str(data, "name"),
    blurb: str(data, "blurb").slice(0, 240),
    url: str(data, "url"),
    instagram: str(data, "instagram").replace(/^@/, ""),
    image_path: str(data, "image_path"),
  };
  if (!friend.name) redirect("/admin/friends?error=" + encodeURIComponent("Give them a name."));
  const i = list.findIndex((f) => f.id === id);
  if (i >= 0) list[i] = friend;
  else list.push(friend);
  await store(supabase, list);
}

export async function deleteFriend(data: FormData) {
  const { supabase, list } = await load();
  await store(supabase, list.filter((f) => f.id !== str(data, "id")));
}

export async function moveFriend(data: FormData) {
  const { supabase, list } = await load();
  const i = list.findIndex((f) => f.id === str(data, "id"));
  const j = i + (str(data, "dir") === "up" ? -1 : 1);
  if (i >= 0 && j >= 0 && j < list.length) [list[i], list[j]] = [list[j], list[i]];
  await store(supabase, list);
}
