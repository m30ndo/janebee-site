import type { NextRequest } from "next/server";
import { liveLogoSvg, logoSvgById } from "@/lib/logo";

/**
 * /logo: the live site logo as an SVG, used by every bee on the site and in the app.
 * ?still=1 gives the non-animated version (3D gallery textures); ?id=… previews one logo in Studio.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const still = url.searchParams.has("still");
  const id = url.searchParams.get("id");
  const svg = id ? await logoSvgById(url.origin, id, still) : await liveLogoSvg(url.origin, still);
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": id ? "private, no-store" : "public, max-age=60, s-maxage=60, stale-while-revalidate=86400",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
      "x-content-type-options": "nosniff",
    },
  });
}
