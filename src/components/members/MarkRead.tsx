"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markRead } from "@/app/members/inbox/actions";

/** Marks what's on screen as read (after a moment, so the "new" dots are seen first). */
export function MarkRead({ ids }: { ids: string[] }) {
  const router = useRouter();
  const key = ids.join(",");
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => { markRead(key.split(",")).then(() => router.refresh()); }, 2500);
    return () => clearTimeout(t);
  }, [key, router]);
  return null;
}
