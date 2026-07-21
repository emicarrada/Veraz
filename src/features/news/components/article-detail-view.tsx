import { getLocale, getTranslations } from "next-intl/server";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { ArticleBackLink } from "@/features/news/components/article-back-link";
import { ArticleContent } from "@/features/news/components/article-content";
import { ArticleHeader } from "@/features/news/components/article-header";
import { ArticleHeroImage } from "@/features/news/components/article-hero-image";
import { ArticleMeta } from "@/features/news/components/article-meta";
import { ArticleReferences } from "@/features/news/components/article-references";
import { NewsAppShell } from "@/features/news/components/news-app-shell";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { feedReturnPathname } from "@/i18n/paths";

export type ArticleDetailViewProps = {
  article: ArticleDetailItem;
};

export async function ArticleDetailView({ article }: ArticleDetailViewProps) {
  const t = await getTranslations("article");
  const tLanguages = await getTranslations("languages");
  const feedHref = feedReturnPathname(article.categorySlug);

  const languageLabel =
    tLanguages(article.languageCode as "es" | "en") || tLanguages("unknown");

  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <article className="mx-auto max-w-3xl space-y-8">
          <ArticleBackLink feedHref={feedHref} />
          <ArticleMeta article={article} />
          {article.isTranslated ? (
            <Tag variant="neutral">{t("translatedBadge")}</Tag>
          ) : null}
          {article.showOriginalLanguageNote ? (
            <Text variant="small" className="text-ink-muted">
              {t("originalLanguageNote", { language: languageLabel })}
            </Text>
          ) : null}
          <ArticleHeader article={article} />

          {article.heroImage ? (
            <ArticleHeroImage
              heroImage={article.heroImage}
              fallbackSrc={article.categoryFallbackImageUrl}
              title={article.title}
            />
          ) : (
            <ArticleHeroImage
              heroImage={{ url: article.categoryFallbackImageUrl }}
              fallbackSrc={article.categoryFallbackImageUrl}
              title={article.title}
            />
          )}

          <ArticleContent article={article} />

          <div className="rounded-xl border border-border bg-surface-muted px-4 py-4 sm:px-5">
            <p className="text-small text-ink-secondary">
              {t("sourceAttribution", { source: article.source.attributionName })}
            </p>
            <div className="mt-4">
              <Button
                href={article.canonicalUrl}
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("readOriginal")} — {article.source.name}
              </Button>
            </div>
          </div>

          <ArticleReferences references={article.references} />
        </article>
      </Section>
    </NewsAppShell>
  );
}

export async function ArticleDetailError({ message }: { message: string }) {
  const t = await getTranslations("errors");

  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <Alert variant="danger" title={t("loadFailed")}>
          {message}
        </Alert>
      </Section>
    </NewsAppShell>
  );
}
