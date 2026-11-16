/** Shared painting/room types and formatters (safe for client and server). */

export type PaintingStatus = "available" | "sold" | "on_request" | "not_for_sale";

export type Painting = {
  id: string;
  slug: string;
  number: number | null;
  title: string;
  glimpse: string | null;
  story: string | null;
  medium: string | null;
  widthCm: number | null;
  heightCm: number | null;
  year: number | null;
  status: PaintingStatus;
  pricePence: number | null;
  image: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  collectionSlug: string | null;
  /** Overrides the room's frame when set. */
  frameStyle?: FrameStyle | null;
};

export type FloorStyle = "oak" | "herringbone" | "walnut" | "concrete" | "marble" | "dark";

export const floorStyles: { value: FloorStyle; label: string }[] = [
  { value: "oak", label: "Light oak boards" },
  { value: "herringbone", label: "Herringbone parquet" },
  { value: "walnut", label: "Dark walnut boards" },
  { value: "concrete", label: "Polished concrete" },
  { value: "marble", label: "White marble" },
  { value: "dark", label: "Black gloss" },
];

export type WallStyle = "plaster" | "limewash" | "panelled" | "brick" | "concrete";

export const wallStyles: { value: WallStyle; label: string }[] = [
  { value: "plaster", label: "Smooth paint" },
  { value: "limewash", label: "Limewash" },
  { value: "panelled", label: "Panelled" },
  { value: "brick", label: "Painted brick" },
  { value: "concrete", label: "Raw concrete" },
];

export const wallColours: { value: string; label: string }[] = [
  { value: "#f4f1ec", label: "Gallery white" },
  { value: "#efe9df", label: "Warm cream" },
  { value: "#d9d2c7", label: "Greige" },
  { value: "#ecd3d8", label: "Blush" },
  { value: "#c9d1c0", label: "Sage" },
  { value: "#e6c27a", label: "Honey" },
  { value: "#2c3440", label: "Ink blue" },
  { value: "#ffffff", label: "Pure white" },
  { value: "#2e2b29", label: "Charcoal" },
  { value: "#141212", label: "Black" },
];

export type FrameStyle = "black" | "white" | "oak" | "walnut" | "gold" | "brass" | "mounted" | "float" | "canvas";

export const frameStyles: { value: FrameStyle; label: string }[] = [
  { value: "black", label: "Slim black" },
  { value: "white", label: "Slim white" },
  { value: "oak", label: "Natural oak" },
  { value: "walnut", label: "Walnut" },
  { value: "gold", label: "Gilded gold" },
  { value: "brass", label: "Thin brass" },
  { value: "mounted", label: "Black with white mount" },
  { value: "float", label: "Float frame" },
  { value: "canvas", label: "No frame (canvas)" },
];

export const isWallStyle = (v: unknown): v is WallStyle => wallStyles.some((w) => w.value === v);
export const isFrameStyle = (v: unknown): v is FrameStyle => frameStyles.some((f) => f.value === v);

export type Post = {
  id: string; slug: string; title: string; excerpt: string | null; body: string | null;
  cover: string | null; publicFrom: string | null; membersFrom: string | null;
};

export type Room = {
  id: string;
  slug: string;
  name: string;
  intro: string | null;
  wallColour: string;
  floorStyle: FloorStyle;
  wallStyle: WallStyle;
  frameStyle: FrameStyle;
  /** honeycomb pattern on the far (door) wall */
  honeycomb: boolean;
  paintings: Painting[];
};

export const formatPrice = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pence / 100);

export const paintingNumber = (n: number | null) => (n == null ? "" : `No. ${String(n).padStart(3, "0")}`);

export const statusLabel: Record<PaintingStatus, string> = {
  available: "Available",
  sold: "Sold — the story stays",
  on_request: "Price on request",
  not_for_sale: "Not for sale",
};

export type Track = { id: string; title: string; artist: string | null; url: string };
