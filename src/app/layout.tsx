import type { Metadata, Viewport } from "next";
import { dmSans, fraunces, punkKid } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Jane Bee — Artist", template: "%s · Jane Bee" },
  description: "Every piece holds a memory. Come closer — the story's Bee-hind.",
  // Private preview: keep every page out of search engines until launch.
  robots: { index: false, follow: false },
  icons: { apple: "/icons/apple-touch-icon.png?v=2" },
};

export const viewport: Viewport = { themeColor: "#111111" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${fraunces.variable} ${punkKid.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
