import type { MetadataRoute } from "next";

// Production (janebee.co.uk) is open to crawlers, except private areas; previews are blocked.
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/studio", "/members", "/api/"] } };
}
