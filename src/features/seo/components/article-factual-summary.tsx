import { getTranslations } from "next-intl/server";

import { Text } from "@/components/ui/text";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { formatFeedDate } from "@/features/news/utils/format-feed-date";

export type ArticleFactualSummaryProps = {
  article: ArticleDetailItem;
};

export async function ArticleFactualSummary({ article }: ArticleFactualSummaryProps) {
  const t = await getTranslations("article");

  const summary = article.excerpt.trim().slice(0, 320);

  return (
    <section
      id="article-factual-summary"
      aria-label={t("factualSummaryAria")}
      className="rounded-xl border border-border bg-surface-muted px-4 py-5 sm:px-6"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <meta itemProp="headline" content={article.title} />
      <meta itemProp="datePublished" content={article.publishedAt} />
      <meta itemProp="url" content={article.canonicalUrl} />

      <Text as="h2" variant="label" className="text-ink">
        {t("factualSummaryTitle")}
      </Text>

      {summary ? (
        <Text as="p" variant="body" className="mt-3 text-ink-secondary" itemProp="description">
          {summary}
        </Text>
      ) : null}

      <dl className="mt-4 grid gap-3 text-small sm:grid-cols-3">
        <div>
          <dt className="font-medium text-ink-muted">{t("factualSourceLabel")}</dt>
          <dd className="mt-1 text-ink-secondary">
            <span itemProp="author">{article.source.attributionName}</span>
            {" — "}
            <a
              href={article.canonicalUrl}
              className="underline underline-offset-2 hover:text-ink"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("readOriginal")}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink-muted">{t("factualPublishedLabel")}</dt>
          <dd className="mt-1 text-ink-secondary">
            <time dateTime={article.publishedAt} itemProp="datePublished">
              {formatFeedDate(article.publishedAt)}
            </time>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink-muted">{t("factualTopicLabel")}</dt>
          <dd className="mt-1 text-ink-secondary" itemProp="articleSection">
            {article.categoryLabel}
          </dd>
        </div>
      </dl>
    </section>
  );
}
