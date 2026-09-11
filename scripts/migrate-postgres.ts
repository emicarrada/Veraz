#!/usr/bin/env tsx
import { applyPostgresMigrations, createPostgresPool, isPostgresPersistenceConfigured } from "@/lib/postgres";

async function main(): Promise<void> {
  if (!isPostgresPersistenceConfigured()) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const applied = await applyPostgresMigrations(createPostgresPool());
  if (applied.length === 0) {
    console.log("Postgres schema is already up to date.");
    return;
  }

  console.log(`Applied ${applied.length} migration(s):`);
  for (const file of applied) {
    console.log(`  ${file}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
