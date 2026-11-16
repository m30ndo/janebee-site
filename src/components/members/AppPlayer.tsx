"use client";

import { usePathname } from "next/navigation";
import type { Track } from "@/lib/painting";
import { MusicFloating, MusicTracks } from "@/components/MusicPlayer";

/** Keeps the playlist loaded across the app; in the gallery the controls live in its bottom bar. */
export function AppPlayer({ tracks, isAdmin }: { tracks: Track[]; isAdmin: boolean }) {
  const path = usePathname();
  return (
    <>
      <MusicTracks tracks={tracks} />
      {!path.startsWith("/members/gallery") && <MusicFloating isAdmin={isAdmin} bottom={84} />}
    </>
  );
}
