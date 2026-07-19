import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { SitePillNav } from "@/components/layout/site-pill-nav";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Veraz",
  description: "Informar sin influenciar.",
  icons: {
    icon: "/veraztrans.png",
    apple: "/veraztrans.png",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Root layout: design-system providers only.
 * Product shells (Header/Footer) are composed by future routes.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" data-theme="dark">
      <body className="min-h-dvh bg-bg font-body text-ink antialiased">
        <ThemeProvider defaultTheme="dark">
          <SitePillNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
