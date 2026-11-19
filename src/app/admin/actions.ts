"use server";

import { isFrameStyle, isWallStyle } from "@/lib/painting";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { fromLocalInput, slugify, toPence } from "@/lib/dates";

const FLOORS = ["oak", "herringbone", "walnut", "concrete", "marble", "dark"];

const str = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const strOrNull = (d: FormData, k: string) => str(d, k) || null;
const intOrNull = (d: FormData, k: string) => {
  const n = parseInt(str(d, k), 10);
  return Number.isFinite(n) ? n : null;
};
const numOrNull = (d: FormData, k: string) => {
  const n = Number(str(d, k));
  return str(d, k) && Number.isFinite(n) ? n : null;
};

function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

async function db() {
  await requireAdmin();
  return serverClient();
}

function refreshPublicContent() {
  updateTag("gallery");
}

/* ---------------------------------------------------------------- rooms */

export async function saveRoom(data: FormData) {
  const supabase = await db();
  const id = str(data, "id");
  const name = str(data, "name");
  const back = `/admin/rooms/${id || "new"}`;
  if (!name) fail(back, "Give the room a name.");
  const row = {
    name,
    slug: slugify(str(data, "slug") || name),
    intro: strOrNull(data, "intro"),
    wall_colour: str(data, "wall_colour") || "#efe9df",
    floor_style: FLOORS.includes(str(data, "floor_style")) ? str(data, "floor_style") : "marble",
    wall_style: isWallStyle(str(data, "wall_style")) ? str(data, "wall_style") : "plaster",
    frame_style: isFrameStyle(str(data, "frame_style")) ? str(data, "frame_style") : "black",
    honeycomb: data.get("honeycomb") === "on",
    sort_order: intOrNull(data, "sort_order") ?? 0,
    public_from: fromLocalInput(data.get("public_from")),
    members_from: fromLocalInput(data.get("members_from")),
  };
  const { data: saved, error } = id
    ? await supabase.from("collections").update(row).eq("id", id).select("id").single()
    : await supabase.from("collections").insert(row).select("id").single();
  if (error) fail(back, error.code === "23505" ? "That web address (slug) is already used by another room." : error.message);
  refreshPublicContent();
  redirect(`/admin/rooms/${saved.id}?saved=1`);
}

export async function deleteRoom(data: FormData) {
  const supabase = await db();
  await supabase.from("collections").delete().eq("id", str(data, "id"));
  refreshPublicContent();
  redirect("/admin/rooms?saved=1");
}

/** Style picker in the gallery (admins only): floor, walls and frames for a room. */
export async function setRoomStyle(roomId: string, style: { floor: string; wallStyle: string; wallColour: string; frame: string; honeycomb: boolean }) {
  const supabase = await db();
  if (!FLOORS.includes(style.floor) || !isWallStyle(style.wallStyle) || !isFrameStyle(style.frame) || !/^#[0-9a-f]{6}$/i.test(style.wallColour))
    return { ok: false };
  const { error } = await supabase
    .from("collections")
    .update({ floor_style: style.floor, wall_style: style.wallStyle, wall_colour: style.wallColour, frame_style: style.frame, honeycomb: !!style.honeycomb })
    .eq("id", roomId);
  if (!error) refreshPublicContent();
  return { ok: !error };
}

/** Move a painting up/down within its room. */
export async function movePainting(data: FormData) {
  const supabase = await db();
  const roomId = str(data, "room_id");
  const id = str(data, "id");
  const dir = str(data, "dir") === "up" ? -1 : 1;
  const { data: list } = await supabase.from("paintings").select("id").eq("collection_id", roomId).order("sort_order").order("created_at");
  const ids = (list ?? []).map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < ids.length) {
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await Promise.all(ids.map((pid, n) => supabase.from("paintings").update({ sort_order: n + 1 }).eq("id", pid)));
    refreshPublicContent();
  }
  redirect(`/admin/rooms/${roomId}`);
}

/* ---------------------------------------------------------------- paintings */

export async function savePainting(data: FormData) {
  const supabase = await db();
  const id = str(data, "id");
  const title = str(data, "title");
  const back = `/admin/paintings/${id || "new"}`;
  if (!title) fail(back, "Give the work a title.");
  const status = str(data, "status");
  const photo = str(data, "kind") === "photo";
  const row = {
    kind: photo ? "photo" : "painting",
    title,
    slug: slugify(str(data, "slug") || title),
    collection_id: strOrNull(data, "collection_id"),
    number: intOrNull(data, "number"),
    glimpse: strOrNull(data, "glimpse"),
    story: strOrNull(data, "story"),
    medium: strOrNull(data, "medium"),
    width_cm: numOrNull(data, "width_cm"),
    height_cm: numOrNull(data, "height_cm"),
    year: intOrNull(data, "year"),
    status: ["available", "sold", "on_request", "not_for_sale"].includes(status) ? status : "available",
    price_pence: toPence(data.get("price")),
    image_path: strOrNull(data, "image_path"),
    image_width: intOrNull(data, "image_width"),
    image_height: intOrNull(data, "image_height"),
    featured: data.get("featured") === "on",
    frame_style: isFrameStyle(str(data, "frame_style")) ? str(data, "frame_style") : null,
    public_from: fromLocalInput(data.get("public_from")),
    members_from: fromLocalInput(data.get("members_from")),
    updated_at: new Date().toISOString(),
  };
  if (photo) {
    // photo shoot: title only, never for sale
    Object.assign(row, { status: "not_for_sale", price_pence: null, number: null, glimpse: null, story: null, medium: null, featured: false });
  } else if (row.status === "available" && !row.price_pence) fail(back, "Add a price, or set the status to 'Price on request'.");

  let result;
  if (id) {
    result = await supabase.from("paintings").update(row).eq("id", id).select("id").single();
  } else {
    // new works go to the end of their room
    const { count } = await supabase.from("paintings").select("id", { count: "exact", head: true }).eq("collection_id", row.collection_id ?? "");
    result = await supabase.from("paintings").insert({ ...row, sort_order: (count ?? 0) + 1 }).select("id").single();
  }
  if (result.error) fail(back, result.error.code === "23505" ? "That web address (slug) is already used by another work." : result.error.message);
  refreshPublicContent();
  redirect(`/admin/paintings/${result.data.id}?saved=1`);
}

export async function deletePainting(data: FormData) {
  const supabase = await db();
  await supabase.from("paintings").delete().eq("id", str(data, "id"));
  refreshPublicContent();
  redirect("/admin/paintings?saved=1");
}

/* ---------------------------------------------------------------- shop */

/** Variants come from a textarea: one per line, "A4 | 45 | 10" (name | price £ | stock, stock optional). */
function parseVariants(text: string) {
  return text
    .split("\n")
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter((p) => p[0])
    .map(([name, price, stock], i) => ({
      name,
      price_pence: toPence(price ?? ""),
      stock: stock ? Math.max(0, parseInt(stock, 10) || 0) : null,
      sort_order: i + 1,
    }));
}

export async function saveProduct(data: FormData) {
  const supabase = await db();
  const id = str(data, "id");
  const name = str(data, "name");
  const back = `/admin/shop/${id || "new"}`;
  if (!name) fail(back, "Give the product a name.");
  const variants = parseVariants(str(data, "variants"));
  if (!variants.length) fail(back, "Add at least one option with a price, e.g. 'A4 | 45'.");
  if (variants.some((v) => !v.price_pence)) fail(back, "Every option needs a price, e.g. 'A4 | 45'.");
  const kind = str(data, "kind");
  const row = {
    name,
    slug: slugify(str(data, "slug") || name),
    kind: ["print", "card", "merch"].includes(kind) ? kind : "print",
    description: strOrNull(data, "description"),
    painting_id: strOrNull(data, "painting_id"),
    image_path: strOrNull(data, "image_path"),
    active: data.get("active") === "on",
    public_from: fromLocalInput(data.get("public_from")),
    members_from: fromLocalInput(data.get("members_from")),
  };
  const { data: saved, error } = id
    ? await supabase.from("products").update(row).eq("id", id).select("id").single()
    : await supabase.from("products").insert(row).select("id").single();
  if (error) fail(back, error.code === "23505" ? "That web address (slug) is already used." : error.message);

  await supabase.from("product_variants").delete().eq("product_id", saved.id);
  const { error: vErr } = await supabase.from("product_variants").insert(variants.map((v) => ({ ...v, product_id: saved.id })));
  if (vErr) fail(`/admin/shop/${saved.id}`, vErr.message);
  refreshPublicContent();
  redirect(`/admin/shop/${saved.id}?saved=1`);
}

export async function deleteProduct(data: FormData) {
  const supabase = await db();
  await supabase.from("products").delete().eq("id", str(data, "id"));
  refreshPublicContent();
  redirect("/admin/shop?saved=1");
}

/* ---------------------------------------------------------------- events */

export async function saveEvent(data: FormData) {
  const supabase = await db();
  const id = str(data, "id");
  const title = str(data, "title");
  const back = `/admin/events/${id || "new"}`;
  const startsAt = fromLocalInput(data.get("starts_at"));
  if (!title) fail(back, "Give the event a title.");
  if (!startsAt) fail(back, "Add a date and time.");
  const row = {
    title,
    slug: slugify(str(data, "slug") || title),
    description: strOrNull(data, "description"),
    starts_at: startsAt,
    location: strOrNull(data, "location"),
    capacity: intOrNull(data, "capacity"),
    members_only: data.get("members_only") === "on",
    image_path: strOrNull(data, "image_path"),
    public_from: fromLocalInput(data.get("public_from")),
    members_from: fromLocalInput(data.get("members_from")),
  };
  const { data: saved, error } = id
    ? await supabase.from("events").update(row).eq("id", id).select("id").single()
    : await supabase.from("events").insert(row).select("id").single();
  if (error) fail(back, error.code === "23505" ? "That web address (slug) is already used." : error.message);
  redirect(`/admin/events/${saved.id}?saved=1`);
}

export async function deleteEvent(data: FormData) {
  const supabase = await db();
  await supabase.from("events").delete().eq("id", str(data, "id"));
  redirect("/admin/events?saved=1");
}

/* ---------------------------------------------------------------- backgrounds */

export async function saveBackground(data: FormData) {
  const supabase = await db();
  const page = str(data, "page");
  const overlay = Math.max(0, Math.min(100, intOrNull(data, "overlay") ?? 60));
  const clear = data.get("clear") === "1";
  const { error } = await supabase.from("page_backgrounds").upsert({
    page,
    image_path: clear ? null : strOrNull(data, "image_path"),
    overlay,
    updated_at: new Date().toISOString(),
  });
  if (error) fail("/admin/backgrounds", error.message);
  updateTag("backgrounds");
  redirect(`/admin/backgrounds?saved=1#${page}`);
}

/* ---------------------------------------------------------------- diary */

const dateOrNull = (d: FormData, k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(str(d, k)) ? str(d, k) : null);

export async function saveDiary(data: FormData) {
  const supabase = await db();
  const id = str(data, "id");
  const title = str(data, "title");
  const back = `/admin/diary/${id || "new"}`;
  const startsOn = dateOrNull(data, "starts_on");
  const endsOn = dateOrNull(data, "ends_on");
  if (!title) fail(back, "Give the showing a title.");
  if (!startsOn) fail(back, "Add the first day.");
  if (endsOn && endsOn < startsOn) fail(back, "The last day is before the first day.");
  const link = str(data, "link");
  const row = {
    title,
    venue: strOrNull(data, "venue"),
    address: strOrNull(data, "address"),
    starts_on: startsOn,
    ends_on: endsOn,
    opening_times: strOrNull(data, "opening_times"),
    opening_at: fromLocalInput(data.get("opening_at")),
    description: strOrNull(data, "description"),
    link: link ? (/^https?:\/\//.test(link) ? link : `https://${link}`) : null,
    image_path: strOrNull(data, "image_path"),
    public_from: fromLocalInput(data.get("public_from")),
    members_from: fromLocalInput(data.get("members_from")),
  };
  const { data: saved, error } = id
    ? await supabase.from("diary").update(row).eq("id", id).select("id").single()
    : await supabase.from("diary").insert(row).select("id").single();
  if (error) fail(back, error.message);
  redirect(`/admin/diary/${saved.id}?saved=1`);
}

export async function deleteDiary(data: FormData) {
  const supabase = await db();
  await supabase.from("diary").delete().eq("id", str(data, "id"));
  redirect("/admin/diary?saved=1");
}

/* ---------------------------------------------------------------- journal */

export async function savePost(data: FormData) {
  const supabase = await db();
  const id = str(data, "id");
  const title = str(data, "title");
  const back = `/admin/journal/${id || "new"}`;
  if (!title) fail(back, "Give the post a title.");
  const row = {
    title,
    slug: slugify(str(data, "slug") || title),
    excerpt: strOrNull(data, "excerpt"),
    category: strOrNull(data, "category"),
    body: strOrNull(data, "body"),
    cover_path: strOrNull(data, "image_path"),
    public_from: fromLocalInput(data.get("public_from")),
    members_from: fromLocalInput(data.get("members_from")),
    updated_at: new Date().toISOString(),
  };
  const { data: saved, error } = id
    ? await supabase.from("posts").update(row).eq("id", id).select("id").single()
    : await supabase.from("posts").insert(row).select("id").single();
  if (error) fail(back, error.code === "23505" ? "That web address (slug) is already used." : error.message);
  redirect(`/admin/journal/${saved.id}?saved=1`);
}

export async function deletePost(data: FormData) {
  const supabase = await db();
  await supabase.from("posts").delete().eq("id", str(data, "id"));
  redirect("/admin/journal?saved=1");
}

/* ---------------------------------------------------------------- music */

export async function addTrack(data: FormData) {
  const supabase = await db();
  const path = str(data, "file_path");
  const title = str(data, "title");
  if (!path || !title) fail("/admin/music", "Upload a file and give it a title.");
  const { count } = await supabase.from("tracks").select("id", { count: "exact", head: true });
  const { error } = await supabase.from("tracks").insert({
    title, artist: strOrNull(data, "artist"), file_path: path, duration_seconds: intOrNull(data, "duration"), sort_order: (count ?? 0) + 1,
  });
  if (error) fail("/admin/music", error.message);
  updateTag("music");
  redirect("/admin/music?saved=1");
}

export async function updateTrack(data: FormData) {
  const supabase = await db();
  await supabase.from("tracks").update({ title: str(data, "title"), artist: strOrNull(data, "artist"), active: data.get("active") === "on" }).eq("id", str(data, "id"));
  updateTag("music");
  redirect("/admin/music?saved=1");
}

export async function deleteTrack(data: FormData) {
  const supabase = await db();
  const { data: t } = await supabase.from("tracks").select("file_path").eq("id", str(data, "id")).maybeSingle();
  await supabase.from("tracks").delete().eq("id", str(data, "id"));
  if (t?.file_path) await supabase.storage.from("music").remove([t.file_path]);
  updateTag("music");
  redirect("/admin/music?saved=1");
}

export async function moveTrack(data: FormData) {
  const supabase = await db();
  const { data: list } = await supabase.from("tracks").select("id").order("sort_order").order("created_at");
  const ids = (list ?? []).map((r) => r.id);
  const i = ids.indexOf(str(data, "id"));
  const j = i + (str(data, "dir") === "up" ? -1 : 1);
  if (i >= 0 && j >= 0 && j < ids.length) {
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await Promise.all(ids.map((id, n) => supabase.from("tracks").update({ sort_order: n + 1 }).eq("id", id)));
    updateTag("music");
  }
  redirect("/admin/music");
}

/* ---------------------------------------------------------------- orders */

export async function setOrderStatus(data: FormData) {
  const supabase = await db();
  const status = str(data, "status");
  if (["pending", "paid", "dispatched", "refunded", "cancelled"].includes(status)) {
    await supabase.from("orders").update({ status }).eq("id", str(data, "id"));
  }
  redirect("/admin/orders?saved=1");
}

/* ---------------------------------------------------------------- home carousel */

const SLIDE_SHAPES = ["whole", "portrait", "square", "landscape"];
const SLIDE_LINKS = ["work", "room", "gallery", "none"];
const SLIDE_FOCUS = ["center", "top", "bottom", "left", "right", "top left", "top right", "bottom left", "bottom right"];

function slideRow(data: FormData) {
  const shape = str(data, "shape");
  const link = str(data, "link");
  const focus = str(data, "focus");
  return {
    image_path: strOrNull(data, "image_path"),
    image_width: intOrNull(data, "image_width"),
    image_height: intOrNull(data, "image_height"),
    caption: strOrNull(data, "caption"),
    painting_id: strOrNull(data, "painting_id"),
    shape: SLIDE_SHAPES.includes(shape) ? shape : "whole",
    link: SLIDE_LINKS.includes(link) ? link : "work",
    focus: SLIDE_FOCUS.includes(focus) ? focus : "center",
    active: data.get("active") === "on",
  };
}

export async function saveCarouselSettings(data: FormData) {
  const supabase = await db();
  const seconds = Math.max(1, Math.min(60, numOrNull(data, "seconds_per_slide") ?? 6));
  const height = str(data, "slide_height");
  const { error } = await supabase.from("carousel_settings").upsert({
    id: 1,
    seconds_per_slide: seconds,
    slide_height: ["small", "medium", "large"].includes(height) ? height : "medium",
    pause_on_hover: data.get("pause_on_hover") === "on",
    updated_at: new Date().toISOString(),
  });
  if (error) fail("/admin/carousel", error.message);
  updateTag("carousel");
  redirect("/admin/carousel?saved=1");
}

export async function addSlide(data: FormData) {
  const supabase = await db();
  const row = slideRow(data);
  if (!row.image_path && !row.painting_id) fail("/admin/carousel", "Upload an image or pick a painting.");
  const { count } = await supabase.from("carousel_slides").select("id", { count: "exact", head: true });
  const { error } = await supabase.from("carousel_slides").insert({ ...row, active: true, sort_order: (count ?? 0) + 1 });
  if (error) fail("/admin/carousel", error.message);
  updateTag("carousel");
  redirect("/admin/carousel?saved=1");
}

export async function updateSlide(data: FormData) {
  const supabase = await db();
  const row = slideRow(data);
  if (!row.image_path && !row.painting_id) fail("/admin/carousel", "A slide needs an image or a painting.");
  const { error } = await supabase.from("carousel_slides").update(row).eq("id", str(data, "id"));
  if (error) fail("/admin/carousel", error.message);
  updateTag("carousel");
  redirect(`/admin/carousel?saved=1#slide-${str(data, "id")}`);
}

export async function deleteSlide(data: FormData) {
  const supabase = await db();
  await supabase.from("carousel_slides").delete().eq("id", str(data, "id"));
  updateTag("carousel");
  redirect("/admin/carousel?saved=1");
}

export async function moveSlide(data: FormData) {
  const supabase = await db();
  const { data: list } = await supabase.from("carousel_slides").select("id").order("sort_order").order("created_at");
  const ids = (list ?? []).map((r) => r.id);
  const i = ids.indexOf(str(data, "id"));
  const want = str(data, "dir");
  // up / down one place, or jump to a numbered position
  const j = want === "up" ? i - 1 : want === "down" ? i + 1 : (intOrNull(data, "position") ?? i + 1) - 1;
  if (i >= 0 && j >= 0 && j < ids.length && i !== j) {
    const [id] = ids.splice(i, 1);
    ids.splice(j, 0, id);
    await Promise.all(ids.map((id, n) => supabase.from("carousel_slides").update({ sort_order: n + 1 }).eq("id", id)));
    updateTag("carousel");
  }
  redirect("/admin/carousel");
}

/* ---------------------------------------------------------------- page images (About portrait…) */

export async function saveSiteImage(data: FormData) {
  const supabase = await db();
  const key = str(data, "key");
  const clear = data.get("clear") === "1";
  const focus = str(data, "focus");
  const { error } = await supabase.from("site_images").upsert({
    key,
    image_path: clear ? null : strOrNull(data, "image_path"),
    image_width: clear ? null : intOrNull(data, "image_width"),
    image_height: clear ? null : intOrNull(data, "image_height"),
    focus: SLIDE_FOCUS.includes(focus) ? focus : "center",
    updated_at: new Date().toISOString(),
  });
  if (error) fail("/admin/about", error.message);
  updateTag("site-images");
  redirect(`/admin/about?saved=1#${key}`);
}
