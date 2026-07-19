import { Text } from "@/components/ui/text";
import { SafeArticleImage } from "@/features/news/components/safe-article-image";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";

export type ArticleHeroImageProps = {
  heroImage: NonNullable<ArticleDetailItem["heroImage"]>;
  fallbackSrc: string;
  title: string;
};

export function ArticleHeroImage({ heroImage, fallbackSrc, title }: ArticleHeroImageProps) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface-muted">
      <SafeArticleImage
        src={heroImage.url}
        fallbackSrc={fallbackSrc}
        alt={heroImage.altText ?? title}
        loading="eager"
        className="aspect-[16/9] w-full"
        imageClassName="aspect-[16/9] w-full"
        placeholderClassName="flex aspect-[16/9] w-full items-center justify-center bg-surface-muted"
      />
      {heroImage.credit ? (
        <figcaption className="border-t border-border px-4 py-2">
          <Text variant="caption" className="text-ink-muted">
            {heroImage.credit}
          </Text>
        </figcaption>
      ) : null}
    </figure>
  );
}
