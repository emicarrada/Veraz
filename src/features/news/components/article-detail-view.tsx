import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ArticleContent } from "@/features/news/components/article-content";
import { ArticleHeader } from "@/features/news/components/article-header";
import { ArticleHeroImage } from "@/features/news/components/article-hero-image";
import { ArticleMeta } from "@/features/news/components/article-meta";
import { ArticleReferences } from "@/features/news/components/article-references";
import { NewsAppShell } from "@/features/news/components/news-app-shell";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";

export type ArticleDetailViewProps = {
  article: ArticleDetailItem;
};

export function ArticleDetailView({ article }: ArticleDetailViewProps) {
  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <article className="mx-auto max-w-3xl space-y-8">
          <ArticleMeta article={article} />
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
              Este resumen proviene de{" "}
              <span className="font-medium text-ink">{article.source.attributionName}</span>.
              Lee el artículo completo en la fuente original.
            </p>
            <div className="mt-4">
              <Button
                href={article.canonicalUrl}
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leer en {article.source.name}
              </Button>
            </div>
          </div>

          <ArticleReferences references={article.references} />
        </article>
      </Section>
    </NewsAppShell>
  );
}

export function ArticleDetailError({ message }: { message: string }) {
  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <Alert variant="danger" title="No se pudo cargar el artículo">
          {message}
        </Alert>
      </Section>
    </NewsAppShell>
  );
}
