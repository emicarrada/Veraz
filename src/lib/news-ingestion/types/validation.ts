import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";

export type ValidatedArticle = {
  article: NormalizedArticle;
  validatedAt: string;
};

export type ValidationRejection = {
  article: NormalizedArticle;
  reason: string;
  code: "missing_field" | "invalid_format" | "source_inactive" | "policy" | "other";
  rejectedAt: string;
};

export type ValidationOutput =
  | { outcome: "accepted"; validated: ValidatedArticle }
  | { outcome: "rejected"; rejection: ValidationRejection };
