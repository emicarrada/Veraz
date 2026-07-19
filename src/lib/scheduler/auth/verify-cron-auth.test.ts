import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { resetConfigCache } from "@/config/accessors";
import { ENV_KEYS, resetEnvSnapshot } from "@/config/env";
import { verifyCronAuth } from "@/lib/scheduler/auth/verify-cron-auth";

describe("verifyCronAuth", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetEnvSnapshot();
    resetConfigCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvSnapshot();
    resetConfigCache();
  });

  it("allows requests in development without secret", () => {
    process.env[ENV_KEYS.VERAZ_ENV] = "development";
    resetEnvSnapshot();
    resetConfigCache();

    const request = new Request("http://localhost/api/cron/ingest/run");
    expect(verifyCronAuth(request)).toBe(true);
  });

  it("requires bearer token in production", () => {
    process.env[ENV_KEYS.VERAZ_ENV] = "production";
    process.env[ENV_KEYS.CRON_SECRET] = "test-secret";
    resetEnvSnapshot();
    resetConfigCache();

    const unauthorized = new Request("http://localhost/api/cron/ingest/run");
    expect(verifyCronAuth(unauthorized)).toBe(false);

    const authorized = new Request("http://localhost/api/cron/ingest/run", {
      headers: { Authorization: "Bearer test-secret" },
    });
    expect(verifyCronAuth(authorized)).toBe(true);
  });

  it("accepts x-cron-secret header in production", () => {
    process.env[ENV_KEYS.VERAZ_ENV] = "production";
    process.env[ENV_KEYS.CRON_SECRET] = "test-secret";
    resetEnvSnapshot();
    resetConfigCache();

    const authorized = new Request("http://localhost/api/cron/ingest/run", {
      headers: { "x-cron-secret": "test-secret" },
    });
    expect(verifyCronAuth(authorized)).toBe(true);
  });

  it("requires secret in staging", () => {
    process.env[ENV_KEYS.VERAZ_ENV] = "staging";
    delete process.env[ENV_KEYS.CRON_SECRET];
    resetEnvSnapshot();
    resetConfigCache();

    const request = new Request("http://localhost/api/cron/ingest/run", {
      headers: { Authorization: "Bearer anything" },
    });
    expect(verifyCronAuth(request)).toBe(false);
  });
});
