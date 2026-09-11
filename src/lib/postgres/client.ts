import { Pool, types } from "pg";

import { ENV_KEYS, getEnv } from "@/config/env";
import { PostgresNotConfiguredError } from "@/lib/postgres/errors";

const TIMESTAMP_OID = 1114;
const TIMESTAMPTZ_OID = 1184;

types.setTypeParser(TIMESTAMP_OID, (value) => new Date(value).toISOString());
types.setTypeParser(TIMESTAMPTZ_OID, (value) => new Date(value).toISOString());

const globalForPg = globalThis as { verazPgPool?: Pool };

export function isPostgresPersistenceConfigured(): boolean {
  return Boolean(getEnv(ENV_KEYS.DATABASE_URL)?.trim());
}

export function resolvePostgresSsl(connectionString: string): false | { rejectUnauthorized: boolean } {
  const normalized = connectionString.toLowerCase();
  if (
    normalized.includes("sslmode=disable") ||
    normalized.includes("ssl=false") ||
    /(localhost|127\.0\.0\.1)/.test(normalized)
  ) {
    return false;
  }
  return { rejectUnauthorized: false };
}

export function createPostgresPool(): Pool {
  const connectionString = getEnv(ENV_KEYS.DATABASE_URL);

  if (!connectionString?.trim()) {
    throw new PostgresNotConfiguredError();
  }

  if (!globalForPg.verazPgPool) {
    globalForPg.verazPgPool = new Pool({
      connectionString,
      max: 4,
      ssl: resolvePostgresSsl(connectionString),
    });
  }

  return globalForPg.verazPgPool;
}

/** Resets the cached pool — for tests only. */
export async function resetPostgresPoolForTests(): Promise<void> {
  if (globalForPg.verazPgPool) {
    await globalForPg.verazPgPool.end();
    globalForPg.verazPgPool = undefined;
  }
}
