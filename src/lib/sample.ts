import type { Painting, Room } from "./painting";

/** Offline copy of the seed data, used only when Supabase env vars are absent (local dev without network). */
const story = "Placeholder story. Jane's own words go here: the memory this piece holds, and why it mattered.";
const p = (o: Partial<Painting> & Pick<Painting, "slug" | "title" | "image" | "imageWidth" | "imageHeight">, room: string, n: number): Painting => ({
  id: o.slug, number: n, glimpse: "Placeholder glimpse.", story, medium: "Mixed media on canvas",
  widthCm: 60, heightCm: 80, year: 2026, status: "available", pricePence: 45000, collectionSlug: room, ...o,
});

export const sampleRooms: Room[] = [
  { id: "r1", slug: "morning-after", name: "Morning After", intro: "Sample room. Coffee, lace and the moments after.", wallColour: "#efe9df", floorStyle: "marble", wallStyle: "plaster", frameStyle: "black", honeycomb: true, paintings: [
    p({ slug: "espresso-served", title: "Espresso, Served", glimpse: "Never everyone's cup of tea.", medium: "Photographic print, framed", widthCm: 60, heightCm: 34, pricePence: 65000, image: "/art/espresso-served.jpg", imageWidth: 1517, imageHeight: 848 }, "morning-after", 1),
    p({ slug: "placeholder-one", title: "Untitled No. 3", image: "/art/placeholder-1.jpg", imageWidth: 900, imageHeight: 1200 }, "morning-after", 3),
    p({ slug: "placeholder-two", title: "Untitled No. 4", status: "sold", pricePence: null, widthCm: 80, heightCm: 60, image: "/art/placeholder-2.jpg", imageWidth: 1200, imageHeight: 900 }, "morning-after", 4),
    p({ slug: "placeholder-three", title: "Untitled No. 5", status: "on_request", pricePence: null, widthCm: 60, heightCm: 60, image: "/art/placeholder-3.jpg", imageWidth: 1000, imageHeight: 1000 }, "morning-after", 5),
  ]},
  { id: "r2", slug: "unapologetic", name: "Unapologetic", intro: "Sample room. Some will love it. Some will raise an eyebrow.", wallColour: "#e9e4dc", floorStyle: "marble", wallStyle: "limewash", frameStyle: "gold", honeycomb: true, paintings: [
    p({ slug: "unapologetic", title: "Unapologetic", glimpse: "She said it with both hands.", status: "on_request", pricePence: null, medium: "Photographic print, framed", widthCm: 50, heightCm: 71, image: "/art/unapologetic.jpg", imageWidth: 1407, imageHeight: 2000 }, "unapologetic", 2),
    p({ slug: "placeholder-four", title: "Untitled No. 6", pricePence: 52000, image: "/art/placeholder-4.jpg", imageWidth: 900, imageHeight: 1200 }, "unapologetic", 6),
    p({ slug: "placeholder-five", title: "Untitled No. 7", pricePence: 58000, widthCm: 90, heightCm: 60, image: "/art/placeholder-5.jpg", imageWidth: 1200, imageHeight: 800 }, "unapologetic", 7),
  ]},
  { id: "r3", slug: "parquet", name: "Herringbone (sample)", intro: "Offline sample room.", wallColour: "#f1e6ea", floorStyle: "herringbone", wallStyle: "panelled", frameStyle: "oak", honeycomb: true, paintings: [
    p({ slug: "placeholder-six", title: "Untitled No. 8", image: "/art/placeholder-6.jpg", imageWidth: 800, imageHeight: 1100 }, "parquet", 8),
  ]},
  { id: "r4", slug: "marble", name: "Marble (sample)", intro: "Offline sample room.", wallColour: "#e8e6e2", floorStyle: "marble", wallStyle: "brick", frameStyle: "mounted", honeycomb: true, paintings: [
    p({ slug: "placeholder-seven", title: "Untitled No. 9", image: "/art/placeholder-7.jpg", imageWidth: 1000, imageHeight: 1300 }, "marble", 9),
  ]},
  { id: "r5", slug: "walnut", name: "Walnut (sample)", intro: "Offline sample room.", wallColour: "#efe9df", floorStyle: "walnut", wallStyle: "concrete", frameStyle: "float", honeycomb: true, paintings: [] },
  { id: "r6", slug: "dark", name: "Dark (sample)", intro: "Offline sample room.", wallColour: "#d9d4cc", floorStyle: "dark", wallStyle: "plaster", frameStyle: "canvas", honeycomb: true, paintings: [] },
];
