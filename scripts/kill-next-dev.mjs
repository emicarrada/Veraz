import { execSync } from "node:child_process";

/**
 * Stop stale Next.js dev servers that would serve broken chunks after `.next` is removed.
 * Safe no-op when nothing is listening.
 */
const PORTS = [3000, 3001, 3002];

for (const port of PORTS) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
    console.log(`[veraz] Stopped process on port ${port}.`);
  } catch {
    // No process on this port.
  }
}
