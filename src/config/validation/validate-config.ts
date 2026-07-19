import type { AppEnvironment } from "@/config/types/environment";

export type ConfigValidationSeverity = "error" | "warning";

export type ConfigValidationIssue = {
  path: string;
  message: string;
  severity: ConfigValidationSeverity;
};

export type ConfigValidationResult = {
  valid: boolean;
  issues: ReadonlyArray<ConfigValidationIssue>;
};

export type ConfigValidator = {
  name: string;
  validate: (config: import("@/config/types/veraz-config").VerazConfig) => ConfigValidationIssue[];
};

/** Hook for future validators (Zod, custom rules). Empty registry today. */
export const CONFIG_VALIDATORS: ReadonlyArray<ConfigValidator> = [];

export function createValidationResult(
  issues: ReadonlyArray<ConfigValidationIssue>,
): ConfigValidationResult {
  const valid = !issues.some((issue) => issue.severity === "error");
  return { valid, issues };
}

/** Minimal bootstrap checks — not a full schema validator. */
export function runBuiltInValidators(
  config: import("@/config/types/veraz-config").VerazConfig,
): ReadonlyArray<ConfigValidationIssue> {
  const issues: ConfigValidationIssue[] = [];

  if (!config.app.siteUrl.startsWith("http")) {
    issues.push({
      path: "app.siteUrl",
      message: "siteUrl must be an absolute http(s) URL.",
      severity: "error",
    });
  }

  if (config.environment === "production" && config.app.siteUrl.includes("localhost")) {
    issues.push({
      path: "app.siteUrl",
      message: "Production should not use localhost as siteUrl.",
      severity: "warning",
    });
  }

  if (config.featureFlags.maintenanceMode && config.environment === "production") {
    issues.push({
      path: "featureFlags.maintenanceMode",
      message: "Maintenance mode is enabled in production.",
      severity: "warning",
    });
  }

  if (
    config.ai.engine.mode !== "disabled" &&
    config.ai.engine.provider === "none"
  ) {
    issues.push({
      path: "ai.engine.provider",
      message: "AI mode is active but provider is none.",
      severity: "warning",
    });
  }

  return issues;
}

export function validateConfig(
  config: import("@/config/types/veraz-config").VerazConfig,
): ConfigValidationResult {
  const issues = [
    ...runBuiltInValidators(config),
    ...CONFIG_VALIDATORS.flatMap((validator) => validator.validate(config)),
  ];
  return createValidationResult(issues);
}

export type { AppEnvironment };
