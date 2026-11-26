import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { AUTOPLAY, CAPTIONS, CARD_SIZES, CURVES, SIDE_EFFECTS, normaliseShopCarousel, type ShopSlide } from "@/lib/shop-carousel";
import { Field, Notice, PageHead, Section, inputCls } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ShopSlideSource } from "@/components/admin/ShopSlideSource";
import { deleteShopSlide, moveShopSlide, saveShopCarouselSettings, saveShopSlide } from "./actions";

type PaintingRow = { id: string; title: string; status: string; image_path: string | null };
type ProductRow = { id: string; name: string; active: boolean; image_path: string | null };

const STATUS: Record<string, string> = { available: "", sold: " · sold", on_request: " · on request", not_for_sale: " · not for sale" };

export default async function ShopCarouselAdmin({ searchParams }: PageProps<"/admin/shop-carousel">) {
  const supabase = await serverClient();
  const [{ data: value }, { data: paintings }, { data: products }] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "shop_carousel").maybeSingle(),
    supabase.from("paintings").select("id, title, status, image_path").eq("kind", "painting").order("number", { ascending: false }),
    supabase.from("products").select("id, name, active, image_path").order("created_at", { ascending: false }),
  ]);
  const { settings: st, slides } = normaliseShopCarousel(value?.value);
  const pList = (paintings ?? []) as PaintingRow[];
  const prList = (products ?? []) as ProductRow[];
  const originals = pList.map((p) => ({ id: p.id, label: `${p.title}${STATUS[p.status] ?? ""}` }));
  const prods = prList.map((p) => ({ id: p.id, label: `${p.name}${p.active ? "" : " · hidden"}` }));
  const pById = new Map(pList.map((p) => [p.id, p]));
  const prById = new Map(prList.map((p) => [p.id, p]));

  const nameOf = (x: ShopSlide) =>
    x.title || (x.source === "original" ? pById.get(x.refId)?.title : x.source === "product" ? prById.get(x.refId)?.name : "") || "Untitled slide";
  const photoOf = (x: ShopSlide) =>
    imageUrl(x.image_path) ?? imageUrl(x.source === "original" ? pById.get(x.refId)?.image_path : x.source === "product" ? prById.get(x.refId)?.image_path : null);

  return (
    <>
      <PageHead title="Carousel" action={{ href: "/", label: "See it on the home page" }}>
        The 3D carousel under the home page's first image and at the top of the shop: cards around a curve that turns on its own, can be dragged or scrolled, and link through. Until you add a slide it shows every original, then the prints.
      </PageHead>
      <Notice searchParams={await searchParams} />

      <form action={saveShopCarouselSettings}>
        <Section title="Settings">
          <label className="flex items-center gap-3 text-sm md:col-span-2">
            <input type="checkbox" name="enabled" defaultChecked={st.enabled} className="accent-honey" />
            Show the carousel in the shop
          </label>
          <Field label="Small label above it" hint="e.g. Fresh off the easel. Empty = none.">
            <input name="kicker" defaultValue={st.kicker} maxLength={60} className={inputCls} />
          </Field>
          <Field label="Heading under the label" hint="Optional, shown in the Heading 2 font.">
            <input name="heading" defaultValue={st.heading} maxLength={80} className={inputCls} placeholder="New work, still warm" />
          </Field>
          <Field label="Movement">
            <select name="autoplay" defaultValue={st.autoplay} className={inputCls}>
              {AUTOPLAY.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Seconds per card" hint="Lower is faster. 1–20.">
            <input type="number" name="speed" min={1} max={20} step={0.5} defaultValue={st.speed} className={inputCls} />
          </Field>
          <Field label="Direction">
            <select name="direction" defaultValue={st.direction} className={inputCls}>
              <option value="left">Moves left</option>
              <option value="right">Moves right</option>
            </select>
          </Field>
          <Field label="Card size" hint="Phones shrink it to fit.">
            <select name="cardSize" defaultValue={st.cardSize} className={inputCls}>
              {CARD_SIZES.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Curve">
            <select name="curve" defaultValue={st.curve} className={inputCls}>
              {CURVES.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="How much it bends" hint="1 = almost flat, 10 = tight curve.">
            <input type="range" name="bend" min={1} max={10} defaultValue={st.bend} className="w-full accent-honey" />
          </Field>
          <Field label="Cards at the sides">
            <select name="sides" defaultValue={st.sides} className={inputCls}>
              {SIDE_EFFECTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Titles and descriptions">
            <select name="captions" defaultValue={st.captions} className={inputCls}>
              {CAPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-3 self-end pb-3 text-sm">
            <input type="checkbox" name="pauseOnHover" defaultChecked={st.pauseOnHover} className="accent-honey" />
            Pause when someone hovers over it
          </label>
          <div className="md:col-span-2">
            <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save settings</button>
          </div>
        </Section>
      </form>

      <form action={saveShopSlide}>
        <Section title="Add a slide">
          <ShopSlideSource originals={originals} products={prods} />
          <SlideText />
          <div className="md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-white/90">Image</span>
            <ImageUpload folder="shop-carousel" hint="Optional for works (a detail or a styled shot instead of the main photo). Needed for your own slides." />
          </div>
          <div className="md:col-span-2">
            <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Add to carousel</button>
          </div>
        </Section>
      </form>

      <h2 className="mt-10 mb-4 font-serif text-2xl font-light">Slides, in order</h2>
      <ol className="space-y-4">
        {slides.length === 0 && <li className="rounded-2xl bg-white/[0.04] p-5 text-sm opacity-60 ring-1 ring-white/10">No slides yet, so the carousel shows every original, then the prints.</li>}
        {slides.map((x, i) => {
          const photo = photoOf(x);
          return (
            <li key={x.id} id={`slide-${x.id}`} className="scroll-mt-6">
              <form action={saveShopSlide} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <input type="hidden" name="id" value={x.id} />
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-honey text-sm font-semibold text-black">{i + 1}</span>
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="h-10 w-8 object-cover" />
                  )}
                  <span className="font-medium">{nameOf(x)}</span>
                  <label className="ml-auto flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" defaultChecked={x.active} className="accent-honey" /> Showing
                  </label>
                  <button formAction={moveShopSlide} formNoValidate name="dir" value="up" disabled={i === 0} className="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-20" aria-label="Move earlier">↑</button>
                  <button formAction={moveShopSlide} formNoValidate name="dir" value="down" disabled={i === slides.length - 1} className="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-20" aria-label="Move later">↓</button>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <ShopSlideSource
                    initial={x.source}
                    paintingId={x.source === "original" ? x.refId : ""}
                    productId={x.source === "product" ? x.refId : ""}
                    originals={originals}
                    products={prods}
                  />
                  <SlideText slide={x} />
                  <div className="md:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-white/90">Image</span>
                    <ImageUpload folder="shop-carousel" initialPath={x.image_path || null} initialUrl={imageUrl(x.image_path)} hint="Empty = the work's own photo." />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save slide</button>
                  <DeleteButton action={deleteShopSlide} what="this slide" />
                </div>
              </form>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function SlideText({ slide }: { slide?: ShopSlide }) {
  return (
    <>
      <Field label="Title" hint="Empty = the work's title.">
        <input name="title" defaultValue={slide?.title} maxLength={80} className={inputCls} />
      </Field>
      <Field label="Description" hint="Empty = price and medium for works.">
        <input name="description" defaultValue={slide?.description} maxLength={200} className={inputCls} />
      </Field>
      <Field label="Link" hint="Empty = the work's page. A page here (/the-hive) or a website (example.com)." wide>
        <input name="link" defaultValue={slide?.link} className={inputCls} placeholder="/the-hive" />
      </Field>
    </>
  );
}
