#!/usr/bin/env npx tsx
/**
 * Open Canva in a persistent Chrome profile so you can log in once (captcha OK).
 * Session is kept in .social/canva-profile/ for later Playwright jobs.
 *
 * Usage:
 *   npm run social:canva-login
 *
 * 1. Chrome opens → log in to Canva (solve captcha if asked).
 * 2. Open your template link to confirm you're in the right account.
 * 3. Close the browser window when done.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const PROFILE_DIR = process.env.CANVA_PROFILE_DIR?.trim() || ".social/canva-profile";
const START_URL = process.env.CANVA_LOGIN_START_URL?.trim() || "https://www.canva.com";
const TEMPLATE_URL = process.env.CANVA_TEMPLATE_URL?.trim();

async function main(): Promise<void> {
  const profilePath = path.resolve(PROFILE_DIR);
  await mkdir(profilePath, { recursive: true });

  console.log("Opening Chrome with persistent profile:");
  console.log(`  ${profilePath}`);
  console.log("");
  console.log("1. Log in to Canva (complete captcha if shown).");
  if (TEMPLATE_URL) {
    console.log(`2. Then open your template: ${TEMPLATE_URL}`);
  }
  console.log("3. Close the browser window to save the session.");
  console.log("");

  const context = await chromium.launchPersistentContext(profilePath, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1400, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(START_URL, { waitUntil: "domcontentloaded" });

  if (TEMPLATE_URL) {
    await page.waitForTimeout(1500);
    console.log("Tip: after login, paste the template URL in the address bar if needed.");
  }

  await context.waitForEvent("close", { timeout: 0 }).catch(() => undefined);
  await context.close();
  console.log("Profile saved. Use CANVA_PROFILE_DIR=.social/canva-profile in publish jobs.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
