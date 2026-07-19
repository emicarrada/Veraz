import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildConfig } from "@/config/build-config";
import { resetEnvSnapshot } from "@/config/env";
import { validateConfig } from "@/config/validation/validate-config";

function loadEnvFile(relativePath: string): void {
  const absolutePath = join(process.cwd(), relativePath);
  if (!existsSync(absolutePath)) return;

  const content = readFileSync(absolutePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");
resetEnvSnapshot();

const result = validateConfig(buildConfig());

for (const issue of result.issues) {
  const prefix = issue.severity === "error" ? "ERROR" : "WARN";
  console.error(`[config:${prefix}] ${issue.path}: ${issue.message}`);
}

if (!result.valid) {
  console.error("[config] Build blocked — fix configuration errors above.");
  process.exit(1);
}

console.log("[config] Configuration validation passed.");
