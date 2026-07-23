import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clashDisplay, faktumTest, montserrat } from "@/styles/fonts";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import Provider from "@/providers/provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

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
      className={cn(
        clashDisplay.variable,
        montserrat.variable,
        faktumTest.variable
      )}
    >
      <body suppressHydrationWarning className={inter.className}>
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
