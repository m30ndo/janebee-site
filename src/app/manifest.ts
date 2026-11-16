import type { MetadataRoute } from "next";

/** Installable members app ("The Hive"). Icons are placeholders until the logo is final. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jane Bee — The Hive",
    short_name: "The Hive",
    description: "Members see Jane Bee's new paintings, prints and invitations first.",
    id: "/members",
    start_url: "/members?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Early access", url: "/members" },
      { name: "Invitations", url: "/members/events" },
      { name: "Gallery", url: "/gallery" },
    ],
  };
}
