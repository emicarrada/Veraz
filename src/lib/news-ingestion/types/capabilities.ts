/**
 * Capabilities a news provider adapter may expose.
 */
export type ProviderCapability =
  | "discover"
  | "fetch"
  | "stream"
  | "health_check";

export const PROVIDER_CAPABILITIES = [
  "discover",
  "fetch",
  "stream",
  "health_check",
] as const satisfies ReadonlyArray<ProviderCapability>;
