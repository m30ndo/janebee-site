"use server";

import { getViewer } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

export async function markRead(ids: string[]) {
  const viewer = await getViewer();
  if (!viewer) return;
  const clean = ids.filter((i) => /^[0-9a-f-]{36}$/.test(i)).slice(0, 50);
  if (!clean.length) return;
  const supabase = await serverClient();
  await supabase.from("message_reads").upsert(clean.map((message_id) => ({ message_id, member_id: viewer.id })), { onConflict: "message_id,member_id", ignoreDuplicates: true });
}

type Sub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function savePushSubscription(sub: Sub): Promise<boolean> {
  const viewer = await getViewer();
  if (!viewer || !sub?.endpoint?.startsWith("https://")) return false;
  const supabase = await serverClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  const { error } = await supabase.from("push_subscriptions").insert({ member_id: viewer.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  return !error;
}

export async function removePushSubscription(endpoint: string) {
  const viewer = await getViewer();
  if (!viewer) return;
  await (await serverClient()).from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function setEmailUpdates(on: boolean) {
  const viewer = await getViewer();
  if (!viewer) return;
  await (await serverClient()).from("profiles").update({ notify_email: on }).eq("id", viewer.id);
}
