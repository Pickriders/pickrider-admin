import { Montserrat } from "next/font/google";
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
