"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { MouseEvent } from "react";

import { cn } from "@/utils/cn";
import { stripLocalePrefix } from "@/i18n/paths";

type ArticleBackLinkProps = {
  feedHref: string;
  className?: string;
};

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M15 10H5M5 10l4-4M5 10l4 4"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function cameFromFeed(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  if (window.history.length <= 1 || !document.referrer) {
    return false;
  }

  try {
    const referrer = new URL(document.referrer);
    const referrerPath = stripLocalePrefix(referrer.pathname);
    return referrer.origin === window.location.origin && referrerPath === "/noticias";
  } catch {
    return false;
  }
}

export function ArticleBackLink({ feedHref, className }: ArticleBackLinkProps) {
  const t = useTranslations("common");
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!cameFromFeed()) {
      return;
    }

    event.preventDefault();
    router.back();
  };

  return (
    <Link
      href={feedHref}
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md py-1.5 pl-1 pr-2",
        "text-body text-ink-secondary hover:text-ink",
        "veraz-transition veraz-focus-ring",
        className,
      )}
      aria-label={t("backToFeedAria")}
    >
      <span
        aria-hidden
        className="inline-flex transition-transform duration-200 group-hover:-translate-x-0.5"
      >
        <ArrowLeftIcon />
      </span>
      <span>{t("backToFeed")}</span>
    </Link>
  );
}
