export {
  buildStaticPageMetadata,
  buildFeedPageMetadata,
  buildSiteVerificationMetadata,
  buildArticleAlternateLanguages,
  publisherLogoUrl,
  openGraphLocale,
  localePriority,
  STATIC_PAGE_SEGMENTS,
  SEO_OG_IMAGE,
} from "@/features/seo/build-page-metadata";
export type { StaticPageSegment, BuildStaticPageMetadataInput } from "@/features/seo/build-page-metadata";

export {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildCollectionPageJsonLd,
  buildOrganizationJsonLd,
  JsonLdScript,
} from "@/features/seo/build-json-ld";
export type { BreadcrumbItem, FaqEntry } from "@/features/seo/build-json-ld";

export {
  buildMainSitemapEntries,
  buildNewsSitemapXml,
  isCategoryLandingSlug,
} from "@/features/seo/sitemap-urls";

export { fetchAllSitemapArticles, fetchRecentNewsSitemapArticles } from "@/features/seo/services/fetch-sitemap-articles";
export { buildOutboundRssFeed, outboundRssLocales } from "@/features/seo/services/build-outbound-rss";
export { notifyIndexNow, notifyArticleIndexNow, buildArticleIndexNowUrls } from "@/features/seo/indexnow";

export { CategoryFeedPage } from "@/features/seo/components/category-feed-page";
export { ArticleFactualSummary } from "@/features/seo/components/article-factual-summary";
export { RelatedArticles } from "@/features/seo/components/related-articles";
