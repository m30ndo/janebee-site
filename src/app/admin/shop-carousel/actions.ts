"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { normaliseSettings, normaliseShopCarousel, type ShopCarousel, type ShopSlide, type SlideSource } from "@/lib/shop-carousel";

const PAGE = "/admin/shop-carousel";
const str = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

async function load() {
  await requireAdmin();
  const supabase = await serverClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "shop_carousel").maybeSingle();
  return { supabase, c: normaliseShopCarousel(data?.value) };
}

async function store(supabase: Awaited<ReturnType<typeof serverClient>>, c: ShopCarousel, hash = "") {
  const { error } = await supabase.from("site_settings").upsert({ key: "shop_carousel", value: c, updated_at: new Date().toISOString() });
  if (error) redirect(`${PAGE}?error=${encodeURIComponent(error.message)}`);
  updateTag("settings");
  redirect(`${PAGE}?saved=1${hash}`);
}

export async function saveShopCarouselSettings(data: FormData) {
  const { supabase, c } = await load();
  c.settings = normaliseSettings({
    enabled: data.get("enabled") === "on",
    autoplay: str(data, "autoplay"),
    speed: str(data, "speed"),
    direction: str(data, "direction"),
    cardSize: str(data, "cardSize"),
    curve: str(data, "curve"),
    bend: str(data, "bend"),
    sides: str(data, "sides"),
    captions: str(data, "captions"),
    pauseOnHover: data.get("pauseOnHover") === "on",
    kicker: str(data, "kicker"),
    heading: str(data, "heading"),
  });
  await store(supabase, c);
}

export async function saveShopSlide(data: FormData) {
  const { supabase, c } = await load();
  const id = str(data, "id") || crypto.randomUUID();
  const source = (["original", "product", "custom"].includes(str(data, "source")) ? str(data, "source") : "custom") as SlideSource;
  const slide: ShopSlide = {
    id,
    source,
    refId: source === "original" ? str(data, "painting_id") : source === "product" ? str(data, "product_id") : "",
    image_path: str(data, "image_path"),
    title: str(data, "title").slice(0, 80),
    description: str(data, "description").slice(0, 200),
    link: str(data, "link"),
    active: data.get("active") === "on" || !str(data, "id"), // new slides show straight away
  };
  if (source !== "custom" && !slide.refId) redirect(`${PAGE}?error=${encodeURIComponent(source === "original" ? "Pick an original." : "Pick a print or product.")}`);
  if (source === "custom" && !slide.image_path) redirect(`${PAGE}?error=${encodeURIComponent("A custom slide needs an image.")}`);
  const i = c.slides.findIndex((x) => x.id === id);
  if (i >= 0) c.slides[i] = slide;
  else c.slides.push(slide);
  await store(supabase, c, `#slide-${id}`);
}

export async function deleteShopSlide(data: FormData) {
  const { supabase, c } = await load();
  c.slides = c.slides.filter((x) => x.id !== str(data, "id"));
  await store(supabase, c);
}

export async function moveShopSlide(data: FormData) {
  const { supabase, c } = await load();
  const id = str(data, "id");
  const i = c.slides.findIndex((x) => x.id === id);
  const j = i + (str(data, "dir") === "up" ? -1 : 1);
  if (i >= 0 && j >= 0 && j < c.slides.length) [c.slides[i], c.slides[j]] = [c.slides[j], c.slides[i]];
  await store(supabase, c, `#slide-${id}`);
}
