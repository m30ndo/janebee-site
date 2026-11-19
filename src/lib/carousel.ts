import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient, imageUrl } from "@/lib/supabase/public";
import { getRooms } from "@/lib/data";

/** Home page works carousel (Studio → Carousel). */

export const FOCUS = ["center", "top", "bottom", "left", "right", "top left", "top right", "bottom left", "bottom right"] as const;
export const SHAPES = [
  { key: "whole", label: "Whole work (no crop)" },
  { key: "portrait", label: "Portrait 4:5" },
  { key: "square", label: "Square" },
  { key: "landscape", label: "Landscape 3:2" },
] as const;
export const HEIGHTS = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
] as const;

export type SlideShape = (typeof SHAPES)[number]["key"];
export type Slide = {
  id: string;
  image: string;
  width: number | null;
  height: number | null;
  caption: string | null;
  focus: string;
  shape: SlideShape;
  /** Where a click goes: the work in the gallery, its room, or nowhere. */
  href: string | null;
};
export type CarouselSettings = { secondsPerSlide: number; height: "small" | "medium" | "large"; pauseOnHover: boolean };

const DEFAULTS: CarouselSettings = { secondsPerSlide: 6, height: "medium", pauseOnHover: true };

type Row = {
  id: string; image_path: string | null; image_width: number | null; image_height: number | null; caption: string | null;
  focus: string; shape: string; link: string;
  paintings: { slug: string; title: string; image_path: string | null; image_width: number | null; image_height: number | null; collections: { slug: string } | null } | null;
};

const isShape = (s: string): s is SlideShape => SHAPES.some((x) => x.key === s);

/** Gallery link for a slide. "work" opens the gallery at the painting; "room" at its room; "gallery" the gallery; "none" no link. */
export function slideHref(link: string, painting: { slug: string; collections: { slug: string } | null } | null): string | null {
  if (link === "none") return null;
  if (!painting?.collections) return "/gallery";
  if (link === "room") return `/gallery?room=${painting.collections.slug}`;
  if (link === "work") return `/gallery?room=${painting.collections.slug}&work=${painting.slug}`;
  return "/gallery";
}

export async function getCarousel(): Promise<{ slides: Slide[]; settings: CarouselSettings }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("carousel");
  cacheTag("gallery");

  let slides: Slide[] = [];
  let settings = DEFAULTS;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const client = publicClient();
    const [{ data: rows }, { data: s }] = await Promise.all([
      client
        .from("carousel_slides")
        .select("id, image_path, image_width, image_height, caption, focus, shape, link, paintings(slug, title, image_path, image_width, image_height, collections(slug))")
        .eq("active", true)
        .order("sort_order")
        .order("created_at"),
      client.from("carousel_settings").select("seconds_per_slide, slide_height, pause_on_hover").eq("id", 1).maybeSingle(),
    ]);
    if (s) {
      settings = {
        secondsPerSlide: Number(s.seconds_per_slide) || DEFAULTS.secondsPerSlide,
        height: (["small", "medium", "large"].includes(s.slide_height) ? s.slide_height : "medium") as CarouselSettings["height"],
        pauseOnHover: s.pause_on_hover ?? true,
      };
    }
    slides = ((rows ?? []) as unknown as Row[]).flatMap((r) => {
      // own photo first, else the linked painting's photo (members-only paintings stay hidden from the public)
      const own = imageUrl(r.image_path);
      const p = r.paintings;
      const image = own ?? imageUrl(p?.image_path);
      if (!image) return [];
      return [{
        id: r.id,
        image,
        width: own ? r.image_width : p?.image_width ?? null,
        height: own ? r.image_height : p?.image_height ?? null,
        caption: r.caption ?? p?.title ?? null,
        focus: r.focus || "center",
        shape: isShape(r.shape) ? r.shape : "whole",
        href: slideHref(r.link, p),
      }];
    });
  }

  // nothing set up yet: show the works hanging in the gallery
  if (!slides.length) {
    const rooms = await getRooms();
    slides = rooms
      .flatMap((room) => room.paintings.map((p) => ({ room, p })))
      .filter(({ p }) => p.image)
      .slice(0, 12)
      .map(({ room, p }) => ({
        id: p.id, image: p.image!, width: p.imageWidth, height: p.imageHeight, caption: p.title, focus: "center", shape: "whole" as const,
        href: `/gallery?room=${room.slug}&work=${p.slug}`,
      }));
  }

  return { slides, settings };
}
