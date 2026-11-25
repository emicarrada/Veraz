import { getTranslations } from "next-intl/server";

import { Text } from "@/components/ui/text";
import { ArticleCard } from "@/features/news/components/article-card";
import type { NewsTopicSlug } from "@/features/news/classification/categories";
import { getFeedPage } from "@/features/news/services/get-feed-page";
import type { Locale } from "@/i18n/routing";

export type RelatedArticlesProps = {
  locale: Locale;
  categorySlug: NewsTopicSlug;
  excludeSlug: string;
  limit?: number;
};

export async function RelatedArticles({
  locale,
  categorySlug,
  excludeSlug,
  limit = 4,
}: RelatedArticlesProps) {
  const t = await getTranslations("article");
  const result = await getFeedPage({ locale, categorySlug, limit: limit + 1 });

  if (!result.ok) return null;

  const related = result.data.items.filter((item) => item.slug !== excludeSlug).slice(0, limit);
  const [next, ...rest] = related;
  if (!next) return null;

  return (
    <section aria-labelledby="next-article-heading" className="space-y-4 border-t border-border pt-8">
      <Text as="h2" id="next-article-heading" variant="label" className="text-ink">
        {t("nextArticle")}
      </Text>
      <ArticleCard item={next} variant="media" />
      {rest.length > 0 ? (
        <div className="space-y-3 pt-2">
          <Text as="h3" variant="label" className="text-ink">
            {t("relatedInCategory", { category: next.categoryLabel })}
          </Text>
          <div className="grid gap-3">
            {rest.map((item) => (
              <ArticleCard key={item.id} item={item} variant="compact" />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
