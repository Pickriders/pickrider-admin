import type { Metadata } from "next";
import "./globals.css";
import { clashDisplay, faktumTest, montserrat, urbanist } from "@/styles/fonts";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import Provider from "@/providers/provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Pickriders Admin",
    template: "%s | Pickriders Admin",
  },
  description: "Platform administration for Pickriders — orders, riders, businesses, finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(urbanist.variable, clashDisplay.variable, montserrat.variable, faktumTest.variable)}
    >
      <head>
        {/* Storefront-matched selectable fonts for the header font switcher. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=BioRhyme:wght@400;700;800&family=DM+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Julius+Sans+One&family=Karla:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=PT+Sans:wght@400;700&family=Quicksand:wght@400;500;600;700&family=Roboto:wght@400;500;700;900&family=Rubik:wght@400;500;600;700;800&family=Saira:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Provider>
            <Toaster position="top-center" richColors />
            {children}
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
