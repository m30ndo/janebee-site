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
