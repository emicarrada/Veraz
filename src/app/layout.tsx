import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/verazicon.png", type: "image/png" }],
    apple: [{ url: "/verazicon.png", type: "image/png" }],
    shortcut: ["/verazicon.png"],
  },
};

/**
 * Root layout — Next.js requires <html> and <body> here (not in nested layouts).
 * Locale-specific lang is synced client-side via HtmlLang in [locale]/layout.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-dvh bg-bg font-body text-ink antialiased">{children}</body>
    </html>
  );
}
