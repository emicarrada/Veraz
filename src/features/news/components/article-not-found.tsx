"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/i18n/navigation";
import { feedPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

export function ArticleNotFound() {
  const t = useTranslations("errors");
  const locale = useLocale() as Locale;

  return (
    <EmptyState
      title={t("articleNotFoundTitle")}
      description={t("articleNotFoundDescription")}
      action={
        <Button href={feedPath(locale)} variant="secondary">
          {t("backToNews")}
        </Button>
      }
    />
  );
}

export function ArticleNotFoundPage() {
  const t = useTranslations("errors");
  const locale = useLocale() as Locale;

  return (
    <div className="py-8">
      <ArticleNotFound />
      <p className="mt-6 text-center">
        <Link
          href={feedPath(locale)}
          className="text-small text-accent veraz-focus-ring rounded-sm hover:underline"
        >
          {t("browseNews")}
        </Link>
      </p>
    </div>
  );
}
