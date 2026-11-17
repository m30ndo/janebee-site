"use client";

import type { Track } from "@/lib/painting";
import { MusicTracks } from "@/components/MusicPlayer";

/** Keeps the playlist loaded across the app. The controls live in the bottom menu (and the gallery's own bar). */
export function AppPlayer({ tracks }: { tracks: Track[] }) {
  return <MusicTracks tracks={tracks} />;
}
