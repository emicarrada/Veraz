"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { formatFeedDayLabel } from "@/features/news/utils/format-feed-day";
import { formatRelativeTime } from "@/features/news/utils/format-relative-time";

export function FeedPublishedTime({ iso }: { iso: string }) {
  const locale = useLocale();
  const t = useTranslations("feed");
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const day = formatFeedDayLabel(iso, locale, {
        today: t("dayToday"),
        yesterday: t("dayYesterday"),
      });
      setLabel(`${day} · ${formatRelativeTime(iso, locale)}`);
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [iso, locale, t]);

  return <time dateTime={iso}>{label ?? "\u00a0"}</time>;
}
