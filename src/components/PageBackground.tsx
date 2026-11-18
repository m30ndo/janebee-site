import { getBackgrounds, type BackgroundPage } from "@/lib/backgrounds";

/**
 * Full-bleed background photo for a page, fixed behind the content, under a
 * solid black cover whose strength (0–100%) is set in Studio → Backgrounds.
 */
export async function PageBackground({ page }: { page: BackgroundPage }) {
  const bg = (await getBackgrounds())[page];
  if (!bg?.image) return null;
  return (
    <div className="pointer-events-none fixed inset-0 -z-[1]" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bg.image} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black" style={{ opacity: bg.overlay / 100 }} />
    </div>
  );
}
