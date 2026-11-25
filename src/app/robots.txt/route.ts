import { getAppConfig } from "@/config";
import { buildRobotsTxt } from "@/features/seo/robots-txt";

export const revalidate = 3600;

export function GET(): Response {
  const { siteUrl } = getAppConfig();
  return new Response(buildRobotsTxt(siteUrl), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
