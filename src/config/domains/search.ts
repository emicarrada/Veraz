/**
 * Search configuration (future FTS / dedicated engine).
 */
export type SearchConfig = {
  enabled: boolean;
  /** Minimum query length before search executes. */
  minQueryLength: number;
  /** Max results per page. */
  pageSize: number;
  /** Backend identifier (postgres_fts | dedicated — future). */
  backend: "postgres_fts" | "disabled";
};

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  enabled: false,
  minQueryLength: 2,
  pageSize: 20,
  backend: "disabled",
};
