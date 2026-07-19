import type { ArticleId, MediaId } from "@/domain/shared/ids";
import type { MediaKind } from "@/domain/shared/enums";
import type { Url } from "@/domain/shared/value-objects";

export type Media = {
  id: MediaId;
  kind: MediaKind;
  /** Logical reference; physical storage is an infrastructure concern. */
  url: Url;
  storageKey?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  altText?: string;
  credit?: string;
  license?: string;
  articleId?: ArticleId;
};
