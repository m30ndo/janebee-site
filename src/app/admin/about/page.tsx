import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { SITE_IMAGES } from "@/lib/site-images";
import { saveSiteImage } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FocusPicker } from "@/components/admin/CarouselControls";
import { Notice, PageHead, Section } from "@/components/admin/ui";

export default async function AboutAdmin({ searchParams }: PageProps<"/admin/about">) {
  const supabase = await serverClient();
  const { data } = await supabase.from("site_images").select("*");
  const byKey = new Map((data ?? []).map((r) => [r.key, r]));

  return (
    <>
      <PageHead title="About page">Jane&apos;s portrait on the About page. (The background photo behind the page is in Backgrounds.)</PageHead>
      <Notice searchParams={await searchParams} />
      {SITE_IMAGES.map((img) => {
        const row = byKey.get(img.key);
        const url = imageUrl(row?.image_path);
        return (
          <form key={img.key} id={img.key} action={saveSiteImage} className="scroll-mt-6">
            <input type="hidden" name="key" value={img.key} />
            <Section title={img.label}>
              <ImageUpload folder="site" initialPath={row?.image_path} initialUrl={url} initialWidth={row?.image_width} initialHeight={row?.image_height} hint={img.hint} />
              <FocusPicker initial={row?.focus ?? "center"} image={url} />
              <div className="flex flex-wrap items-center gap-4 md:col-span-2">
                <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save portrait</button>
                {row?.image_path && <button name="clear" value="1" className="text-sm text-white/60 underline underline-offset-4 hover:text-white">Remove photo</button>}
              </div>
            </Section>
          </form>
        );
      })}
    </>
  );
}
