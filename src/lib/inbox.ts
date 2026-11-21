import "server-only";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import type { MemberMessage, MessageKind } from "@/lib/messages";

/** The signed-in member's inbox: sent messages, newest first, with read state. Request-time. */
export async function getInbox(memberId: string): Promise<MemberMessage[]> {
  const supabase = await serverClient();
  const [{ data: msgs }, { data: reads }] = await Promise.all([
    supabase.from("member_messages").select("id, kind, title, body, link_url, link_label, image_path, sent_at").eq("status", "sent").order("sent_at", { ascending: false }).limit(50),
    supabase.from("message_reads").select("message_id").eq("member_id", memberId),
  ]);
  const read = new Set((reads ?? []).map((r) => r.message_id));
  return (msgs ?? []).map((m) => ({
    id: m.id, kind: m.kind as MessageKind, title: m.title, body: m.body, linkUrl: m.link_url, linkLabel: m.link_label,
    image: imageUrl(m.image_path), sentAt: m.sent_at, read: read.has(m.id),
  }));
}

export async function unreadCount(memberId: string): Promise<number> {
  return (await getInbox(memberId)).filter((m) => !m.read).length;
}
