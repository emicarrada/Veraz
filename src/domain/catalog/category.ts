import type { CategoryId } from "@/domain/shared/ids";
import type { CatalogStatus } from "@/domain/shared/enums";
import type { Slug } from "@/domain/shared/value-objects";

export type Category = {
  id: CategoryId;
  slug: Slug;
  name: string;
  description?: string;
  parentId?: CategoryId;
  sortOrder: number;
  status: CatalogStatus;
};
