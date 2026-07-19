/**
 * Deployment environment for Veraz configuration profiles.
 */
export type AppEnvironment = "development" | "staging" | "production";

export const APP_ENVIRONMENTS = [
  "development",
  "staging",
  "production",
] as const satisfies ReadonlyArray<AppEnvironment>;
