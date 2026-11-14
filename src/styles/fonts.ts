import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

// Urbanist (the default interface face, matching the storefront) is self-hosted in
// globals.css (@font-face "Urbanist" from public/assets/fonts/urbanist), so it never
// depends on reaching Google Fonts at build or dev time.

export const clashDisplay = localFont({
  src: [
    {
      path: "../../public/assets/fonts/clashDisplay/ClashDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/clashDisplay/ClashDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/clashDisplay/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
});

export const faktumTest = localFont({
  src: [
    {
      path: "../../public/assets/fonts/faktum-test/Rene Bieder - Faktum Test Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/faktum-test/Rene Bieder - Faktum Test Bold.woff",
      weight: "500",
      style: "normal",
    },
    // {
    //   path: "../../public/assets/fonts/clashDisplay/ClashDisplay-Bold.woff2",
    //   weight: "700",
    //   style: "normal",
    // },
  ],
  variable: "--font-faktum-test",
});

export const montserrat = Montserrat({
  weight: ["100", "200", "300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

/**
 * Karla for numbers only: a face that covers just the digits and the marks around
 * them (+ - , . % :), placed first in every font stack. The browser draws every
 * number in Karla and everything else in the font the admin picked, so figures read
 * the same on every page, matching the Pickriders storefront admin. Self-hosted
 * (Karla is open source, SIL OFL), latin subset, variable weight.
 */
export const adminDigits = localFont({
  src: "../../public/assets/fonts/karla/karla-latin-variable.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-admin-digits",
  preload: false,
  // No fallback faces: anything outside the digits falls through to the admin's font.
  fallback: [],
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0030-0039, U+002B, U+002C, U+002D, U+002E, U+0025, U+003A, U+2212" }],
});
