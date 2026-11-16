import type { Metadata } from "next";
import { getRooms } from "@/lib/data";
import { Gallery } from "@/components/gallery/Gallery";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const rooms = await getRooms();
  return <Gallery rooms={rooms} />;
}
