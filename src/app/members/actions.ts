"use server";

import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

export async function rsvp(data: FormData) {
  const viewer = await requireMember("/members/events");
  const eventId = String(data.get("event_id") ?? "");
  const status = data.get("status") === "not_going" ? "not_going" : "going";
  const guests = Math.min(3, Math.max(0, parseInt(String(data.get("guests") ?? "0"), 10) || 0));
  const supabase = await serverClient();
  await supabase
    .from("event_rsvps")
    .upsert({ event_id: eventId, member_id: viewer.id, status, guests: status === "going" ? guests : 0 }, { onConflict: "event_id,member_id" });
  redirect(`/members/events?replied=${status}`);
}
