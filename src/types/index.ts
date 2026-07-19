/**
 * Shared domain / cross-cutting types.
 * Feature-specific types belong under `src/features/<feature>/types`.
 */

export type Brand<T, TBrand extends string> = T & {
  readonly __brand: TBrand;
};
