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
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-articles-heading" className="space-y-4 border-t border-border pt-8">
      <Text as="h2" id="related-articles-heading" variant="label" className="text-ink">
        {t("relatedInCategory", { category: related[0]?.categoryLabel ?? categorySlug })}
      </Text>
      <div className="grid gap-4">
        {related.map((item) => (
          <ArticleCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
