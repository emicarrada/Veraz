import type { MetadataRoute } from "next";

import { getAppConfig } from "@/config";

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = getAppConfig();
  const base = siteUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: [`${base}/sitemap.xml`, `${base}/sitemap-news.xml`],
    host: base,
  };
}
