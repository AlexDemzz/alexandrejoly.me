import BgGrid from "@/components/BgGrid";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import AppProvider from "@/lib/Providers/AppProvider";
import PreloaderProvider from "@/lib/Providers/Preloader";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import Transition from "./transition";

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
      className={`${GeistSans.variable} ${GeistMono.variable} md:cursor-none`}
    >
      <body>
        <Analytics />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <Cursor />
            {/* <PreloaderProvider> */}
            <Header />
            {/* <Transition>{children}</Transition> */}
            {children}
            <Footer />
            {/* </PreloaderProvider> */}
          </AppProvider>
          <BgGrid />
        </ThemeProvider>
      </body>
    </html>
  );
}
