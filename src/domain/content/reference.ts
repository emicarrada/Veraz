import type { ArticleId, ReferenceId } from "@/domain/shared/ids";
import type { ReferenceKind } from "@/domain/shared/enums";
import type { Instant, Url } from "@/domain/shared/value-objects";

export type Reference = {
  id: ReferenceId;
  articleId: ArticleId;
  url: Url;
  title?: string;
  publisherName?: string;
  kind: ReferenceKind;
  accessedAt?: Instant;
};
