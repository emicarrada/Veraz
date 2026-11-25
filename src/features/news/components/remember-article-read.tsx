"use client";

import { useEffect } from "react";

import { rememberReadSlug } from "@/features/news/utils/feed-memory";

export function RememberArticleRead({ slug }: { slug: string }) {
  useEffect(() => {
    rememberReadSlug(slug);
  }, [slug]);

  return null;
}
