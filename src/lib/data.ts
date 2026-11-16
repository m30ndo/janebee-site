import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient, imageUrl } from "@/lib/supabase/public";
import { sampleRooms } from "@/lib/sample";
import type { Painting, PaintingStatus, Room } from "@/lib/painting";

export * from "@/lib/painting";

const offline = !process.env.NEXT_PUBLIC_SUPABASE_URL;

type PaintingRow = {
  id: string; slug: string; number: number | null; title: string; glimpse: string | null; story: string | null;
  medium: string | null; width_cm: number | null; height_cm: number | null; year: number | null;
  status: PaintingStatus; price_pence: number | null; image_path: string | null;
  image_width: number | null; image_height: number | null; collections?: { slug: string } | null;
};

const PAINTING_COLS =
  "id, slug, number, title, glimpse, story, medium, width_cm, height_cm, year, status, price_pence, image_path, image_width, image_height";

function toPainting(r: PaintingRow, collectionSlug: string | null = r.collections?.slug ?? null): Painting {
  return {
    id: r.id, slug: r.slug, number: r.number, title: r.title, glimpse: r.glimpse, story: r.story,
    medium: r.medium, widthCm: r.width_cm, heightCm: r.height_cm, year: r.year, status: r.status,
    pricePence: r.price_pence, image: imageUrl(r.image_path), imageWidth: r.image_width,
    imageHeight: r.image_height, collectionSlug,
  };
}

/** All public rooms (collections) with their paintings, in hanging order. */
export async function getRooms(): Promise<Room[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("gallery");
  if (offline) return sampleRooms;
  const { data, error } = await publicClient()
    .from("collections")
    .select(`id, slug, name, intro, wall_colour, sort_order, paintings (${PAINTING_COLS}, sort_order)`)
    .order("sort_order")
    .order("sort_order", { referencedTable: "paintings" });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id, slug: c.slug, name: c.name, intro: c.intro, wallColour: c.wall_colour,
    paintings: (c.paintings as PaintingRow[]).map((p) => toPainting(p, c.slug)),
  }));
}

export async function getPainting(slug: string): Promise<Painting | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("gallery");
  if (offline) return sampleRooms.flatMap((r) => r.paintings).find((p) => p.slug === slug) ?? null;
  const { data } = await publicClient()
    .from("paintings")
    .select(`${PAINTING_COLS}, collections (slug)`)
    .eq("slug", slug)
    .maybeSingle();
  return data ? toPainting(data as unknown as PaintingRow) : null;
}

export async function getPaintingSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  if (offline) return sampleRooms.flatMap((r) => r.paintings.map((p) => p.slug));
  const { data } = await publicClient().from("paintings").select("slug");
  return (data ?? []).map((r) => r.slug);
}
