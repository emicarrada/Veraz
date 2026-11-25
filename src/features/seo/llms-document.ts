import { catalogLabelForSlug } from "@/config/domains/rss-feed-catalog";
import { articleDetailPath, feedCategoryPath, feedPath, staticPath } from "@/i18n/paths";
import { NEWS_FEED_TAB_ORDER } from "@/features/news/classification/categories";

export type LlmsArticle = {
  slug: string;
  title: string;
  publishedAt: string;
  sourceSlug: string;
  categorySlug: string;
  languageCode: string;
};

function spanishArticles(articles: ReadonlyArray<LlmsArticle>): LlmsArticle[] {
  return articles
    .filter((article) => article.languageCode === "es" || article.languageCode.startsWith("es"))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function citeLine(siteUrl: string, article: LlmsArticle): string {
  const base = siteUrl.replace(/\/$/, "");
  const source = catalogLabelForSlug(article.sourceSlug) ?? article.sourceSlug;
  const day = article.publishedAt.slice(0, 10);
  const url = `${base}${articleDetailPath("es", article.slug)}`;
  return `- [${article.title}](${url}) — ${source}, ${day}, ${article.categorySlug}`;
}

export function buildLlmsTxt(siteUrl: string, articles: ReadonlyArray<LlmsArticle>): string {
  const base = siteUrl.replace(/\/$/, "");
  const recent = spanishArticles(articles).slice(0, 40);
  const sections = NEWS_FEED_TAB_ORDER.map(
    (slug) => `- [${slug}](${base}${feedCategoryPath("es", slug)})`,
  );

  return [
    "# Veraz",
    "> Agregador de noticias en español para México. Cada ficha enlaza a la fuente original. Veraz no redactó el reportaje.",
    "",
    "## Cómo citar",
    "Cita el titular, el medio original y la fecha. Enlaza la ficha de Veraz. No atribuyas a Veraz la autoría del hecho.",
    "",
    "## Secciones",
    `- [Noticias](${base}${feedPath("es")})`,
    ...sections,
    `- [Qué pasó ayer](${base}${staticPath("es", "/ayer")})`,
    `- [Metodología](${base}${staticPath("es", "/metodologia")})`,
    `- [Fuentes](${base}${staticPath("es", "/fuentes")})`,
    "",
    "## Noticias recientes",
    ...recent.map((article) => citeLine(base, article)),
    "",
    "## Archivos",
    `- ${base}/llms-full.txt`,
    `- ${base}/sitemap.xml`,
    `- ${base}/sitemap-news.xml`,
    `- ${base}/es/noticias/feed.xml`,
    "",
  ].join("\n");
}

export function buildLlmsFullTxt(siteUrl: string, articles: ReadonlyArray<LlmsArticle>): string {
  const recent = spanishArticles(articles).slice(0, 150);
  return [
    "# Veraz — fichas recientes en español",
    "",
    ...recent.map((article) => citeLine(siteUrl, article)),
    "",
  ].join("\n");
}
