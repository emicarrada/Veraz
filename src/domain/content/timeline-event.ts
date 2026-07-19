import type { ArticleId, StoryId, TimelineEventId } from "@/domain/shared/ids";
import type {
  TimelineEventOrigin,
  TimelineEventStatus,
} from "@/domain/shared/enums";
import type { Instant } from "@/domain/shared/value-objects";

export type TimelineEvent = {
  id: TimelineEventId;
  storyId: StoryId;
  occurredAt: Instant;
  label: string;
  detail: string;
  sourceArticleId?: ArticleId;
  sortKey: number;
  origin: TimelineEventOrigin;
  status: TimelineEventStatus;
};
