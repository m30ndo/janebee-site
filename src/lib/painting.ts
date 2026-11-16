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

export type Room = {
  id: string;
  slug: string;
  name: string;
  intro: string | null;
  wallColour: string;
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
