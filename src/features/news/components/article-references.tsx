import { getTranslations } from "next-intl/server";

import { Text } from "@/components/ui/text";
import type { ArticleDetailReference } from "@/features/news/types/article-detail";

export type ArticleReferencesProps = {
  references: ReadonlyArray<ArticleDetailReference>;
};

export async function ArticleReferences({ references }: ArticleReferencesProps) {
  const t = await getTranslations("article");

  const kindLabels: Record<ArticleDetailReference["kind"], string> = {
    original: "Original",
    primary_source: "Primary source",
    supporting: "Reference",
    correction: "Correction",
  };

  if (references.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="article-references-heading" className="space-y-4">
      <Text variant="h4" as="h2" id="article-references-heading">
        {t("referencesTitle")}
      </Text>
      <ul className="m-0 list-none space-y-3 p-0">
        {references.map((reference, index) => (
          <li
            key={`${reference.url}-${index}`}
            className="rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="caption" className="text-ink-muted">
                {kindLabels[reference.kind]}
              </Text>
              {reference.publisherName ? (
                <Text variant="caption" className="text-ink-muted">
                  · {reference.publisherName}
                </Text>
              ) : null}
            </div>
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block veraz-focus-ring rounded-sm text-body text-accent underline-offset-4 hover:underline"
            >
              {reference.title ?? reference.url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
