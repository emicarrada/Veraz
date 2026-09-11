import { buildOutboundRssFeed } from "@/features/seo/services/build-outbound-rss";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const revalidate = 300;

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { locale } = await context.params;

  if (!routing.locales.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }

  const xml = await buildOutboundRssFeed(locale as Locale);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
