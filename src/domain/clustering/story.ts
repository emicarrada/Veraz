import type { ArticleId, CountryId, StoryId } from "@/domain/shared/ids";
import type { StoryArticleRole, StoryStatus } from "@/domain/shared/enums";
import type { Instant, Slug } from "@/domain/shared/value-objects";

export type Story = {
  id: StoryId;
  slug: Slug;
  title: string;
  summary?: string;
  startedAt?: Instant;
  endedAt?: Instant;
  primaryCountryId?: CountryId;
  status: StoryStatus;
};

/** Join: Article participation inside a Story. */
export type StoryArticle = {
  storyId: StoryId;
  articleId: ArticleId;
  role: StoryArticleRole;
};
