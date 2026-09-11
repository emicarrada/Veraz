import type { MetadataRoute } from "next";

import { buildMainSitemapEntries } from "@/features/seo/sitemap-urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildMainSitemapEntries();
}
