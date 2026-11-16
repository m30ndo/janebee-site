import type { Metadata } from "next";
import { Suspense } from "react";
import { getRoomsForViewer } from "@/lib/data";
import { Gallery } from "@/components/gallery/Gallery";

export const metadata: Metadata = { title: "Gallery" };

async function AppGallery() {
  return <Gallery rooms={await getRoomsForViewer()} app />;
}

export default function MembersGallery() {
  return (
    <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-ink text-sm tracking-[0.3em] text-cream/60 uppercase">Opening the gallery…</div>}>
      <AppGallery />
    </Suspense>
  );
}
