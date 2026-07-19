import type {
  ArticleId,
  NotificationId,
  StoryId,
  UserId,
} from "@/domain/shared/ids";
import type { NotificationKind, NotificationStatus } from "@/domain/shared/enums";
import type { Instant, Url } from "@/domain/shared/value-objects";

export type Notification = {
  id: NotificationId;
  userId: UserId;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: Url;
  articleId?: ArticleId;
  storyId?: StoryId;
  status: NotificationStatus;
  createdAt: Instant;
};
