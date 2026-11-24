import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { HEIGHTS, SHAPES } from "@/lib/carousel";
import { addSlide, deleteSlide, moveSlide, saveCarouselSettings, updateSlide } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FocusPicker, SpeedSlider } from "@/components/admin/CarouselControls";
import { Field, Notice, PageHead, Section, inputCls } from "@/components/admin/ui";

type PaintingOpt = { id: string; title: string; image_path: string | null; collections: { name: string } | null };
type SlideRow = {
  id: string; image_path: string | null; image_width: number | null; image_height: number | null; caption: string | null;
  painting_id: string | null; focus: string; shape: string; link: string; active: boolean;
};

const LINKS = [
  { key: "work", label: "Straight to the painting, hanging in the gallery" },
  { key: "room", label: "The painting's room in the gallery" },
  { key: "gallery", label: "The gallery (first room)" },
  { key: "none", label: "No link" },
];

export default async function CarouselAdmin({ searchParams }: PageProps<"/admin/carousel">) {
  const supabase = await serverClient();
  const [{ data: settings }, { data: slides }, { data: paintings }] = await Promise.all([
    supabase.from("carousel_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("carousel_slides").select("*").order("sort_order").order("created_at"),
    supabase.from("paintings").select("id, title, image_path, collections(name)").order("title"),
  ]);
  const opts = (paintings ?? []) as unknown as PaintingOpt[];
  const list = (slides ?? []) as SlideRow[];
  const byId = new Map(opts.map((p) => [p.id, p]));

  return (
    <>
      <PageHead title="Home carousel">
        The slow line of works under the first section of the home page. Until you add a slide it shows the works hanging in the gallery.
      </PageHead>
      <Notice searchParams={await searchParams} />

      <form action={saveCarouselSettings}>
        <Section title="Settings">
          <SpeedSlider initial={Number(settings?.seconds_per_slide ?? 6)} />
          <Field label="Size">
            <select name="slide_height" defaultValue={settings?.slide_height ?? "medium"} className={inputCls}>
              {HEIGHTS.map((h) => <option key={h.key} value={h.key}>{h.label}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-3 self-end pb-3 text-sm">
            <input type="checkbox" name="pause_on_hover" defaultChecked={settings?.pause_on_hover ?? true} className="accent-honey" />
            Pause when someone hovers over it
          </label>
          <div className="md:col-span-2">
            <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save settings</button>
          </div>
        </Section>
      </form>

      <form action={addSlide}>
        <Section title="Add a slide">
          <ImageUpload folder="carousel" hint="Upload a photo, or leave this empty and pick a painting below to use its photo." />
          <SlideFields opts={opts} />
          <div className="md:col-span-2">
            <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Add to carousel</button>
          </div>
        </Section>
      </form>

      <h2 className="mt-10 mb-4 font-serif text-2xl font-light">Slides, in order</h2>
      <ol className="space-y-4">
        {list.length === 0 && <li className="rounded-2xl bg-white/[0.04] p-5 text-sm opacity-60 ring-1 ring-white/10">No slides yet — the carousel is showing the gallery&apos;s works for now.</li>}
        {list.map((s, i) => {
          const painting = s.painting_id ? byId.get(s.painting_id) : undefined;
          const preview = imageUrl(s.image_path) ?? imageUrl(painting?.image_path);
          return (
            <li key={s.id} id={`slide-${s.id}`} className="scroll-mt-6">
              <form action={updateSlide} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <input type="hidden" name="id" value={s.id} />
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-honey text-sm font-semibold text-black">{i + 1}</span>
                  <span className="font-medium">{s.caption || painting?.title || "Untitled slide"}</span>
                  <label className="ml-auto flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" defaultChecked={s.active} className="accent-honey" /> Showing
                  </label>
                  <button formAction={moveSlide} name="dir" value="up" disabled={i === 0} className="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-20" aria-label="Move earlier">↑</button>
                  <button formAction={moveSlide} name="dir" value="down" disabled={i === list.length - 1} className="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-20" aria-label="Move later">↓</button>
                  <span className="flex items-center gap-1 text-sm">
                    <select name="position" defaultValue={i + 1} className={`${inputCls} w-auto py-1`} aria-label="Position">
                      {list.map((_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                    </select>
                    <button formAction={moveSlide} name="dir" value="to" className="rounded-lg px-2 py-1 text-xs hover:bg-white/10">Move</button>
                  </span>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <ImageUpload
                    folder="carousel"
                    initialPath={s.image_path}
                    initialUrl={preview}
                    initialWidth={s.image_width}
                    initialHeight={s.image_height}
                    hint="Leave as the painting's photo, or upload a different shot (a detail, a studio photo…)."
                  />
                  <SlideFields opts={opts} slide={s} preview={preview} />
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save slide</button>
                  <DeleteButton action={deleteSlide} what="this slide" />
                </div>
              </form>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function SlideFields({ opts, slide, preview = null }: { opts: PaintingOpt[]; slide?: SlideRow; preview?: string | null }) {
  return (
    <>
      <Field label="Painting" hint="Links the slide to this work in the gallery (and uses its photo if you didn't upload one).">
        <select name="painting_id" defaultValue={slide?.painting_id ?? ""} className={inputCls}>
          <option value="">— None —</option>
          {opts.map((p) => <option key={p.id} value={p.id}>{p.title}{p.collections ? ` · ${p.collections.name}` : ""}</option>)}
        </select>
      </Field>
      <Field label="When clicked, go to">
        <select name="link" defaultValue={slide?.link ?? "work"} className={inputCls}>
          {LINKS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
        </select>
      </Field>
      <Field label="Caption" hint="Shown under the image. Empty = the painting's title.">
        <input name="caption" defaultValue={slide?.caption ?? ""} className={inputCls} />
      </Field>
      <Field label="Shape">
        <select name="shape" defaultValue={slide?.shape ?? "whole"} className={inputCls}>
          {SHAPES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </Field>
      <FocusPicker initial={slide?.focus ?? "center"} image={preview} />
    </>
  );
}
