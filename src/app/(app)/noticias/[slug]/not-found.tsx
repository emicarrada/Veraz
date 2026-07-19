import { NewsAppShell } from "@/features/news/components/news-app-shell";
import { ArticleNotFoundPage } from "@/features/news/components/article-not-found";
import { Section } from "@/components/ui/section";

export default function ArticleNotFoundRoute() {
  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <ArticleNotFoundPage />
      </Section>
    </NewsAppShell>
  );
}
