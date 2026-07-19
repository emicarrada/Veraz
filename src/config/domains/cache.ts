/**
 * Cache / ISR configuration (future wiring to Next.js revalidateTag).
 */
export type CacheConfig = {
  defaultTtlSeconds: number;
  feedRevalidateSeconds: number;
  articleRevalidateSeconds: number;
  enabled: boolean;
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  defaultTtlSeconds: 60,
  feedRevalidateSeconds: 120,
  articleRevalidateSeconds: 300,
  enabled: true,
};
