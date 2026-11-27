import { serverClient } from "@/lib/supabase/server";
import { normaliseHero } from "@/lib/home-hero";
import { Notice, PageHead } from "@/components/admin/ui";
import { HeroEditor } from "@/components/admin/HeroEditor";
import { saveHomeHero } from "./actions";

export default async function HeroAdmin({ searchParams }: PageProps<"/admin/hero">) {
  const supabase = await serverClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "home_hero").maybeSingle();
  return (
    <>
      <PageHead title="Hero editor" action={{ href: "/", label: "See the home page" }}>
        The first image on the home page, as visitors see it. Pick Phone, Tablet or Desktop, then drag: the headline to place it, the pink bar to set the photo&apos;s height, and in Photo focus the dot onto the part of the photo that must stay in view. The photo itself is set in Backgrounds.
      </PageHead>
      <Notice searchParams={await searchParams} />
      <HeroEditor initial={normaliseHero(data?.value)} save={saveHomeHero} />
    </>
  );
}
