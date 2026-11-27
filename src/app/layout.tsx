import type { Metadata, Viewport } from "next";
import { dmSans, fraunces, soulHand } from "./fonts";
import "./globals.css";
import { BrushButtons } from "@/components/BrushButtons";
import { FontStyles } from "@/components/FontStyles";

export const metadata: Metadata = {
  title: { default: "Jane Bee — Artist", template: "%s · Jane Bee" },
  description: "Every piece holds a memory. Come closer — the story's Bee-hind.",
  metadataBase: new URL("https://www.janebee.co.uk"),
  // Indexable on production only; preview deployments stay out of search engines.
  robots: process.env.VERCEL_ENV === "production" ? { index: true, follow: true } : { index: false, follow: false },
  icons: { apple: "/icons/apple-touch-icon.png?v=2" },
};

export const viewport: Viewport = { themeColor: "#000000", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${fraunces.variable} ${soulHand.variable} h-full`}>
      <body className="min-h-full">
        <FontStyles />
        {children}
        <BrushButtons />
      </body>
    </html>
  );
}
