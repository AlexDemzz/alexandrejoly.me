import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Cursor from "@/components/Cursor";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import BgGrid from "@/components/BgGrid";
import AppProvider from "@/lib/Providers/AppProvider";

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
            {children}
            <BgGrid />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
