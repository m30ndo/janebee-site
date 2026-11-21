import localFont from "next/font/local";

export const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-latin-full-normal.woff2", style: "normal" },
    { path: "./fonts/fraunces-latin-full-italic.woff2", style: "italic" },
  ],
  weight: "100 900",
  variable: "--font-fraunces",
  display: "swap",
});

export const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans-latin-opsz-normal.woff2", style: "normal" },
    { path: "./fonts/dm-sans-latin-opsz-italic.woff2", style: "italic" },
  ],
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
});


// I eat crayons (FontPanda): the handwritten scribble ("VERY"). Listed as 100% free on DaFont.
export const iEatCrayons = localFont({
  src: "./fonts/i-eat-crayons.woff2",
  variable: "--font-i-eat-crayons",
  display: "swap",
});
