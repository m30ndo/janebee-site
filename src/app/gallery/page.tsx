import type { Metadata } from "next";
import { Suspense } from "react";
import { getRoomsForViewer, getTracks } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { Gallery } from "@/components/gallery/Gallery";

export const metadata: Metadata = { title: "Gallery" };

async function MemberAwareGallery() {
  const [rooms, viewer, tracks] = await Promise.all([getRoomsForViewer(), getViewer(), getTracks()]);
  return <Gallery rooms={rooms} isAdmin={viewer?.role === "admin"} tracks={tracks} />;
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-ink text-sm tracking-[0.3em] text-cream/60 uppercase">Opening the gallery…</div>}>
      <MemberAwareGallery />
    </Suspense>
  );
}
