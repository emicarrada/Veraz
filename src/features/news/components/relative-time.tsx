"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { formatRelativeTime } from "@/features/news/utils/format-relative-time";

export function RelativeTime({ iso }: { iso: string }) {
  const locale = useLocale();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLabel(formatRelativeTime(iso, locale));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [iso, locale]);

  return <time dateTime={iso}>{label ?? "\u00a0"}</time>;
}
