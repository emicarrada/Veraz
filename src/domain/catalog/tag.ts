import type { TagId } from "@/domain/shared/ids";
import type { CatalogStatus } from "@/domain/shared/enums";
import type { Slug } from "@/domain/shared/value-objects";

export type Tag = {
  id: TagId;
  slug: Slug;
  label: string;
  status: CatalogStatus;
};
