/**
 * Stable error codes for the News Ingestion Engine.
 */

export type IngestionErrorCode =
  | "provider_not_implemented"
  | "provider_unconfigured"
  | "provider_unavailable"
  | "provider_not_registered"
  | "duplicate_provider_registration"
  | "rate_limited"
  | "timeout"
  | "parse_failure"
  | "not_found"
  | "policy_violation"
  | "validation_failed"
  | "normalization_failed"
  | "dedupe_conflict"
  | "story_assignment_failed"
  | "persistence_failed"
  | "publish_failed"
  | "stage_not_implemented"
  | "invalid_input"
  | "unknown";

export type PipelineStageId =
  | "discover"
  | "fetch"
  | "normalize"
  | "validate"
  | "dedupe"
  | "story"
  | "enrichment"
  | "persistence"
  | "publish";

export type PipelineErrorCode =
  | "stage_not_implemented"
  | "stage_input_invalid"
  | "stage_execution_failed"
  | "stage_skipped"
  | "upstream_failure";
