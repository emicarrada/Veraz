import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";

export async function FeedEmptyState() {
  const t = await getTranslations("feed");

  return (
    <div className="space-y-3">
      <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      <Text variant="small" className="text-center text-ink-muted">
        {t("emptyIngestHint")}
      </Text>
    </div>
  );
}
