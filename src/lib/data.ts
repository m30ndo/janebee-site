import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient, imageUrl } from "@/lib/supabase/public";
import { sampleRooms } from "@/lib/sample";
import type { FloorStyle, Painting, PaintingStatus, Post, Room, Track } from "@/lib/painting";
import { isFrameStyle, isWallStyle } from "@/lib/painting";

export * from "@/lib/painting";

const offline = !process.env.NEXT_PUBLIC_SUPABASE_URL;

type PaintingRow = {
  id: string; slug: string; number: number | null; title: string; glimpse: string | null; story: string | null;
  medium: string | null; width_cm: number | null; height_cm: number | null; year: number | null;
  status: PaintingStatus; price_pence: number | null; image_path: string | null;
  image_width: number | null; image_height: number | null; frame_style?: string | null; collections?: { slug: string } | null;
};

const PAINTING_COLS =
  "id, slug, number, title, glimpse, story, medium, width_cm, height_cm, year, status, price_pence, image_path, image_width, image_height, frame_style";

function toPainting(r: PaintingRow, collectionSlug: string | null = r.collections?.slug ?? null): Painting {
  return {
    id: r.id, slug: r.slug, number: r.number, title: r.title, glimpse: r.glimpse, story: r.story,
    medium: r.medium, widthCm: r.width_cm, heightCm: r.height_cm, year: r.year, status: r.status,
    pricePence: r.price_pence, image: imageUrl(r.image_path), imageWidth: r.image_width,
    imageHeight: r.image_height, collectionSlug,
    frameStyle: isFrameStyle(r.frame_style) ? r.frame_style : null,
  };
}

type Client = ReturnType<typeof publicClient>;

async function queryRooms(client: Client): Promise<Room[]> {
  const { data, error } = await client
    .from("collections")
    .select(`id, slug, name, intro, wall_colour, floor_style, wall_style, frame_style, sort_order, paintings (${PAINTING_COLS}, sort_order)`)
    .order("sort_order")
    .order("sort_order", { referencedTable: "paintings" });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id, slug: c.slug, name: c.name, intro: c.intro, wallColour: c.wall_colour, floorStyle: (c.floor_style ?? "marble") as FloorStyle,
    wallStyle: isWallStyle(c.wall_style) ? c.wall_style : "plaster", frameStyle: isFrameStyle(c.frame_style) ? c.frame_style : "black",
    paintings: (c.paintings as PaintingRow[]).map((p) => toPainting(p, c.slug)),
  }));
}

/** All public rooms (collections) with their paintings, in hanging order. Cached. */
export async function getRooms(): Promise<Room[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("gallery");
  if (offline) return sampleRooms;
  return queryRooms(publicClient());
}

/** Rooms as the signed-in visitor sees them (members get early-access rooms and works). Request-time. */
export async function getRoomsForViewer(): Promise<Room[]> {
  if (offline) return sampleRooms;
  const { serverClient } = await import("@/lib/supabase/server");
  const client = await serverClient();
  const { data } = await client.auth.getClaims();
  if (!data?.claims) return getRooms();
  return queryRooms(client as unknown as Client);
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

/** A work as the signed-in visitor sees it (members can open early-access works). Request-time. */
export async function getPaintingForViewer(slug: string): Promise<Painting | null> {
  if (offline) return getPainting(slug);
  const { serverClient } = await import("@/lib/supabase/server");
  const { data } = await (await serverClient())
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

/* ---------------------------------------------------------------- shop */

export type ShopProduct = {
  id: string; slug: string; name: string; kind: string; description: string | null; image: string | null;
  membersFirst: boolean; variants: { id: string; name: string; price_pence: number; stock: number | null }[];
};

type ProductRow = {
  id: string; slug: string; name: string; kind: string; description: string | null; image_path: string | null;
  public_from: string | null; product_variants: { id: string; name: string; price_pence: number; stock: number | null; sort_order: number }[];
};

const toProduct = (p: ProductRow): ShopProduct => ({
  id: p.id, slug: p.slug, name: p.name, kind: p.kind, description: p.description, image: imageUrl(p.image_path),
  membersFirst: !p.public_from || Date.parse(p.public_from) > Date.now(),
  variants: [...p.product_variants].sort((a, b) => a.sort_order - b.sort_order).map(({ id, name, price_pence, stock }) => ({ id, name, price_pence, stock })),
});

const PRODUCT_COLS = "id, slug, name, kind, description, image_path, public_from, product_variants(id, name, price_pence, stock, sort_order)";

/** Shop contents as the visitor sees them: available originals + products. Request-time (members see more). */
export async function getShopForViewer(): Promise<{ originals: Painting[]; products: ShopProduct[] }> {
  if (offline) {
    return { originals: sampleRooms.flatMap((r) => r.paintings).filter((p) => p.status === "available"), products: [] };
  }
  const { serverClient } = await import("@/lib/supabase/server");
  const client = await serverClient();
  const [{ data: originals }, { data: products }] = await Promise.all([
    client.from("paintings").select(`${PAINTING_COLS}, collections (slug)`).eq("status", "available").order("number", { ascending: false }),
    client.from("products").select(PRODUCT_COLS).eq("active", true).order("created_at", { ascending: false }),
  ]);
  return {
    originals: ((originals ?? []) as unknown as PaintingRow[]).map((p) => toPainting(p)),
    products: ((products ?? []) as unknown as ProductRow[]).map(toProduct),
  };
}

export async function getProductForViewer(slug: string): Promise<ShopProduct | null> {
  if (offline) return null;
  const { serverClient } = await import("@/lib/supabase/server");
  const { data } = await (await serverClient()).from("products").select(PRODUCT_COLS).eq("slug", slug).eq("active", true).maybeSingle();
  return data ? toProduct(data as unknown as ProductRow) : null;
}

/* ---------------------------------------------------------------- journal */

type PostRow = { id: string; slug: string; title: string; excerpt: string | null; body: string | null; cover_path: string | null; public_from: string | null; members_from: string | null };
const toPost = (r: PostRow): Post => ({
  id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body, cover: imageUrl(r.cover_path),
  publicFrom: r.public_from, membersFrom: r.members_from,
});
const POST_COLS = "id, slug, title, excerpt, body, cover_path, public_from, members_from";

/** Journal posts the visitor can see, newest first. Request-time (members see theirs first). */
export async function getPostsForViewer(): Promise<Post[]> {
  if (offline) return [];
  const { serverClient } = await import("@/lib/supabase/server");
  const { data } = await (await serverClient()).from("posts").select(POST_COLS).order("members_from", { ascending: false, nullsFirst: false });
  return ((data ?? []) as PostRow[]).map(toPost);
}

export async function getPostForViewer(slug: string): Promise<Post | null> {
  if (offline) return null;
  const { serverClient } = await import("@/lib/supabase/server");
  const { data } = await (await serverClient()).from("posts").select(POST_COLS).eq("slug", slug).maybeSingle();
  return data ? toPost(data as PostRow) : null;
}

/* ---------------------------------------------------------------- music */

/** Playlist for the gallery and app player. */
export async function getTracks(): Promise<Track[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("music");
  if (offline) return [];
  const { data } = await publicClient().from("tracks").select("id, title, artist, file_path").eq("active", true).order("sort_order").order("created_at");
  return (data ?? []).map((t) => ({
    id: t.id, title: t.title, artist: t.artist,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/music/${t.file_path}`,
  }));
}
