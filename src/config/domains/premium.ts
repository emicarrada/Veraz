/**
 * Premium / monetization configuration (declarative only).
 */
export type PremiumConfig = {
  enabled: boolean;
  /** Billing provider identifier (future — stripe | none). */
  billingProvider: "none" | "stripe";
  trialDays: number;
};

export const DEFAULT_PREMIUM_CONFIG: PremiumConfig = {
  enabled: false,
  billingProvider: "none",
  trialDays: 0,
};
