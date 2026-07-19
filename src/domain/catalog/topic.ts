import type { TopicId } from "@/domain/shared/ids";
import type { CatalogStatus } from "@/domain/shared/enums";
import type { Slug } from "@/domain/shared/value-objects";

export type Topic = {
  id: TopicId;
  slug: Slug;
  name: string;
  summary?: string;
  status: CatalogStatus;
};
