import { getBackgrounds, type BackgroundPage } from "@/lib/backgrounds";

/**
 * Background photo for a page, under a solid black cover whose strength
 * (0–100%) is set in Studio → Backgrounds.
 * - "page" (default): fixed full-bleed behind the whole page.
 * - "section": fills only its parent (which must be `relative`), fading to black at the bottom.
 */
export async function PageBackground({ page, fit = "page" }: { page: BackgroundPage; fit?: "page" | "section" }) {
  const bg = (await getBackgrounds())[page];
  if (!bg?.image) return null;
  if (fit === "section") {
    return (
      <div className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bg.image} alt="" className="hero-photo h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black" style={{ opacity: bg.overlay / 100 }} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
      </div>
    );
  }
  return (
    <div className="pointer-events-none fixed inset-0 -z-[1]" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bg.image} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black" style={{ opacity: bg.overlay / 100 }} />
    </div>
  );
}
