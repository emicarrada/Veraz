import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Pool } from "pg";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase/migrations");

export async function applyPostgresMigrations(pool: Pool): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const applied: string[] = [];

  for (const file of files) {
    const existing = await pool.query("SELECT 1 FROM schema_migrations WHERE id = $1", [file]);
    if ((existing.rowCount ?? 0) > 0) continue;

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO schema_migrations (id) VALUES ($1)", [file]);
      await pool.query("COMMIT");
      applied.push(file);
    } catch (error) {
      await pool.query("ROLLBACK");
      const message = error instanceof Error ? error.message : "unknown";
      throw new Error(`Migration ${file} failed: ${message}`);
    }
  }

  return applied;
}
