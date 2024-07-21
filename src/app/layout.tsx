import BgGrid from "@/components/BgGrid";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import AppProvider from "@/lib/Providers/AppProvider";
import PreloaderProvider from "@/lib/Providers/Preloader";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Alexandre Joly — Portfolio",
  description: "Creative front-end Developer",
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
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <Cursor />
            <Header />
            <PreloaderProvider>
              {children}
              <Footer />
            </PreloaderProvider>
            <BgGrid />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
