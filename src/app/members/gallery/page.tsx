import type { Metadata } from "next";
import { Suspense } from "react";
import { getRoomsForViewer } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { Gallery } from "@/components/gallery/Gallery";

export const metadata: Metadata = { title: "Gallery" };

async function AppGallery() {
  const [rooms, viewer] = await Promise.all([getRoomsForViewer(), getViewer()]);
  return <Gallery rooms={rooms} app isAdmin={viewer?.role === "admin"} />;
}

export default function MembersGallery() {
  return (
    <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-ink text-sm tracking-[0.3em] text-cream/60 uppercase">Opening the gallery…</div>}>
      <AppGallery />
    </Suspense>
  );
}
