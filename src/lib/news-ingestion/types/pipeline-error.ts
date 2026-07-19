import type { PipelineErrorPayload } from "@/lib/news-ingestion/errors/base";

/** Serializable pipeline error for stage results and PipelineState. */
export type PipelineError = PipelineErrorPayload;
