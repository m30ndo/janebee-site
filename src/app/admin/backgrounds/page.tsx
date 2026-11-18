import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { BACKGROUND_PAGES } from "@/lib/backgrounds";
import { saveBackground } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { OverlaySlider } from "@/components/admin/OverlaySlider";
import { Notice, PageHead, Section } from "@/components/admin/ui";

export default async function BackgroundsAdmin({ searchParams }: PageProps<"/admin/backgrounds">) {
  const supabase = await serverClient();
  const { data } = await supabase.from("page_backgrounds").select("page, image_path, overlay");
  const byPage = new Map((data ?? []).map((r) => [r.page, r]));

  return (
    <>
      <PageHead title="Backgrounds">
        A full-bleed photo behind each page, with a solid black cover over it you can set from 0 to 100%.
      </PageHead>
      <Notice searchParams={await searchParams} />
      {BACKGROUND_PAGES.map((pg) => {
        const row = byPage.get(pg.key);
        return (
          <form key={pg.key} id={pg.key} action={saveBackground} className="scroll-mt-6">
            <input type="hidden" name="page" value={pg.key} />
            <Section title={pg.label}>
              <ImageUpload folder="backgrounds" initialPath={row?.image_path} initialUrl={imageUrl(row?.image_path)} hint="A wide photo works best (landscape, at least 2000px across). It fills the whole screen behind the page." />
              <OverlaySlider initial={row?.overlay ?? 60} image={imageUrl(row?.image_path)} />
              <div className="flex flex-wrap items-center gap-4 md:col-span-2">
                <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save {pg.label.toLowerCase()}</button>
                {row?.image_path && (
                  <button name="clear" value="1" className="text-sm text-white/60 underline underline-offset-4 hover:text-white">Remove photo</button>
                )}
              </div>
            </Section>
          </form>
        );
      })}
    </>
  );
}
