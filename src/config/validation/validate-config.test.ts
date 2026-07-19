import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { buildConfig } from "@/config/build-config";
import { ENV_KEYS, resetEnvSnapshot } from "@/config/env";
import { runBuiltInValidators } from "@/config/validation/validate-config";

describe("runBuiltInValidators security rules", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetEnvSnapshot();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvSnapshot();
  });

  it("errors when production lacks CRON_SECRET", () => {
    process.env[ENV_KEYS.VERAZ_ENV] = "production";
    delete process.env[ENV_KEYS.CRON_SECRET];
    delete process.env[ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY];
    resetEnvSnapshot();

    const issues = runBuiltInValidators(buildConfig());
    expect(
      issues.some(
        (issue) =>
          issue.path === "security.cronSecret" && issue.severity === "error",
      ),
    ).toBe(true);
  });
});
