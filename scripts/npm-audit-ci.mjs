#!/usr/bin/env node
/**
 * CI audit: fail on high/critical except known Next.js vendored postcss/sharp chain.
 * Root sharp is 0.35.3; Next still ships nested copies npm audit flags until upstream fixes.
 */
import { spawnSync } from "node:child_process";

const ALLOWED_CHAIN = new Set(["next", "next-intl", "postcss", "sharp"]);

const result = spawnSync("npm", ["audit", "--audit-level=high", "--json"], {
  encoding: "utf8",
  shell: false,
});

const audit = JSON.parse(result.stdout || "{}");
const vulns = audit.vulnerabilities ?? {};
const blocking = [];

for (const [name, info] of Object.entries(vulns)) {
  const severity = info.severity ?? "";
  if (severity !== "high" && severity !== "critical") continue;

  const via = info.via ?? [];
  const chainNames = new Set([name]);
  for (const entry of via) {
    if (typeof entry === "string") chainNames.add(entry);
    else if (entry && typeof entry === "object" && "name" in entry) {
      chainNames.add(String(entry.name));
    }
  }

  const onlyNextBundled = [...chainNames].every((pkg) => ALLOWED_CHAIN.has(pkg));
  if (!onlyNextBundled) {
    blocking.push({ name, severity });
  }
}

if (blocking.length > 0) {
  console.error("npm audit: blocking high/critical vulnerabilities:");
  for (const item of blocking) {
    console.error(`  - ${item.name} (${item.severity})`);
  }
  process.exit(1);
}

const known = Object.keys(vulns).filter((k) => ALLOWED_CHAIN.has(k));
if (known.length > 0) {
  console.warn(
    `npm audit: ignoring ${known.length} advisory chain(s) in Next vendored deps (postcss/sharp).`,
  );
}

process.exit(0);
