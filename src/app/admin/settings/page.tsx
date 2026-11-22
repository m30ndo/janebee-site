import { requireSuperAdmin } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { normaliseTypography } from "@/lib/typography";
import { Notice, PageHead } from "@/components/admin/ui";
import { TypographyPicker } from "@/components/admin/TypographyPicker";
import { saveTypography } from "./actions";

export default async function SettingsAdmin({ searchParams }: PageProps<"/admin/settings">) {
  await requireSuperAdmin();
  const supabase = await serverClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "typography").maybeSingle();
  return (
    <>
      <PageHead title="Settings">Super admin only. Site-wide choices that change the whole look.</PageHead>
      <Notice searchParams={await searchParams} />
      <h2 className="mb-2 font-h2 text-2xl font-light">Typography</h2>
      <p className="mb-6 max-w-2xl text-sm text-white/60">
        Four fonts run the whole site and app. Pick one for each and see it below. The handwritten scribble (Soul Handwriting, as in &ldquo;VERY&rdquo;) is part of the brand and stays as it is.
      </p>
      <form action={saveTypography}>
        <TypographyPicker initial={normaliseTypography(data?.value)} />
        <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-4 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur">
          <button className="rounded-full bg-honey px-8 py-3 font-medium text-black hover:bg-white">Save fonts</button>
          <button name="reset" value="1" className="text-sm text-white/60 underline underline-offset-4 hover:text-white">Back to the original fonts</button>
        </div>
      </form>
    </>
  );
}
