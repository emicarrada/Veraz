import type { AppEnvironment } from "@/config/types/environment";

/**
 * Core application identity and runtime profile.
 */
export type AppConfig = {
  name: string;
  tagline: string;
  environment: AppEnvironment;
  siteUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
};

export const DEFAULT_APP_NAME = "Veraz" as const;
export const DEFAULT_APP_TAGLINE = "Informar sin influenciar." as const;

export const DEFAULT_SITE_URLS: Record<AppEnvironment, string> = {
  development: "http://localhost:3000",
  staging: "https://staging.veraz.example",
  production: "https://veraz.example",
};
