import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PostHogAnalytics } from "@/components/analytics/posthog-analytics";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SitePillNav } from "@/components/layout/site-pill-nav";
import { getAnalyticsConfig } from "@/config/accessors";
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
  const analytics = getAnalyticsConfig();
  const posthogKey = analytics.publicId;
  const posthogHost = analytics.posthogHost;
  const posthogEnabled =
    analytics.enabled &&
    analytics.provider === "posthog" &&
    Boolean(posthogKey && posthogHost);

  const app = (
    <>
      <SitePillNav />
      {children}
    </>
  );

  return (
    <html lang="es" data-theme="dark">
      <body className="min-h-dvh bg-bg font-body text-ink antialiased">
        <ThemeProvider defaultTheme="dark">
          {posthogEnabled && posthogKey && posthogHost ? (
            <PostHogAnalytics apiKey={posthogKey} apiHost={posthogHost}>
              {app}
            </PostHogAnalytics>
          ) : (
            app
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
