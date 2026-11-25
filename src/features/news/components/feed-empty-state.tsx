import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/ui/empty-state";

export async function FeedEmptyState() {
  const t = await getTranslations("feed");

  return <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />;
}
