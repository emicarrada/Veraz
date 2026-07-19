import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const markerPath = join(process.cwd(), ".next", ".production-build");

mkdirSync(join(process.cwd(), ".next"), { recursive: true });
writeFileSync(markerPath, new Date().toISOString(), "utf8");

console.log("[veraz] Production build marker written (.next/.production-build).");
console.log("[veraz] Use `npm run dev` (auto-cleans) or `npm run start` for production.");
