import { getShopCarousel } from "@/lib/settings";
import { resolveCards } from "@/lib/shop-carousel";
import type { Painting } from "@/lib/painting";
import type { ShopProduct } from "@/lib/data";
import { ArcCarousel } from "./ArcCarousel";

/** The shop's 3D carousel, filled from Studio → Shop carousel (or the shop itself when empty). */
export async function ShopCarousel({ originals, products, base = "", className = "" }: { originals: Painting[]; products: ShopProduct[]; base?: string; className?: string }) {
  const c = await getShopCarousel();
  if (!c.settings.enabled) return null;
  const cards = resolveCards(c, originals, products, base);
  if (!cards.length) return null;
  const { kicker, heading } = c.settings;
  return (
    <section aria-label="Featured" className={className}>
      {(kicker || heading) && (
        <div className="mb-6 text-center md:mb-8">
          {kicker && <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">{kicker}</p>}
          {heading && <h2 className="mt-2 font-h2 text-3xl font-light md:text-4xl">{heading}</h2>}
        </div>
      )}
      <ArcCarousel cards={cards} settings={c.settings} />
    </section>
  );
}
