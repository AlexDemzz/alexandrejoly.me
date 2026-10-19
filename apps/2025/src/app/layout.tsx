import BgGrid from "@/components/BgGrid";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import AppProvider from "@/lib/Providers/AppProvider";
import PreloaderProvider from "@/lib/Providers/Preloader";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import Transition from "./transition";
import Scrollbar from "@/components/Scrollbar";

export const metadata: Metadata = {
  title: "Alexandre Joly - Portfolio",
  description: "Creative developer based in Geneva",
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
      className={`${GeistSans.variable} ${GeistMono.variable} md:cursor-none no-scrollbar`}
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
            <PreloaderProvider>
              <Header />
              <Scrollbar />
              <Transition>{children}</Transition>
              <Footer />
            </PreloaderProvider>
          </AppProvider>
          <BgGrid />
        </ThemeProvider>
      </body>
    </html>
  );
}
