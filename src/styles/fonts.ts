import localFont from "next/font/local";

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
