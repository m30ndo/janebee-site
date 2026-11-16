"use client";

import { usePathname } from "next/navigation";
import type { Track } from "@/lib/painting";
import { MusicPlayer } from "@/components/MusicPlayer";

/** The app's music player, lifted clear of the gallery's controls bar. */
export function AppPlayer({ tracks, isAdmin }: { tracks: Track[]; isAdmin: boolean }) {
  const path = usePathname();
  return <MusicPlayer tracks={tracks} bottom={path.startsWith("/members/gallery") ? 160 : 84} isAdmin={isAdmin} />;
}
