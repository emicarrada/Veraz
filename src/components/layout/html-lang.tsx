"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Syncs document.documentElement.lang when locale changes (html lives in root layout). */
export function HtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
