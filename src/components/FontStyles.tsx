import { getTypography } from "@/lib/settings";
import { googleFontsHref, typographyCss } from "@/lib/typography";

/** Points the type slots at the fonts chosen in Studio (nothing when the defaults are in use). */
export async function FontStyles() {
  const { fonts, sizes } = await getTypography();
  const href = googleFontsHref(fonts);
  const css = typographyCss(fonts, sizes);
  return (
    <>
      {href && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={href} precedence="default" />
        </>
      )}
      {css && <style href="jb-typography" precedence="default">{css}</style>}
    </>
  );
}
