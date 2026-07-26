#!/usr/bin/env npx tsx
/**
 * Log in to a social network once; session stays in .social/*-profile/
 *
 * Usage:
 *   npm run social:login -- x
 *   npm run social:login -- instagram
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

import { profileDirForPlatform } from "@/lib/social-publishing/publish";

const LOGIN_PLATFORMS = ["x", "instagram", "tiktok"] as const;

const START_URLS: Record<(typeof LOGIN_PLATFORMS)[number], string> = {
  x: "https://x.com/login",
  instagram: "https://www.instagram.com/accounts/login/",
  tiktok: "https://www.tiktok.com/login",
};

async function main(): Promise<void> {
  const platformArg = process.argv[2]?.trim().toLowerCase();
  if (!LOGIN_PLATFORMS.includes(platformArg as (typeof LOGIN_PLATFORMS)[number])) {
    console.error("Usage: npm run social:login -- x|instagram|tiktok");
    console.error("Reels usan la misma sesión que instagram.");
    process.exit(1);
  }

  const platform = platformArg as (typeof LOGIN_PLATFORMS)[number];
  const profilePath = path.resolve(profileDirForPlatform(platform, process.env));
  await mkdir(profilePath, { recursive: true });

  console.log(`Opening Chrome for ${platform}:`);
  console.log(`  Profile: ${profilePath}`);
  console.log(`  URL: ${START_URLS[platform]}`);
  console.log("");
  console.log("1. Log in (captcha / 2FA if needed).");
  console.log("2. Close the browser window to save the session.");
  console.log("");

  const context = await chromium.launchPersistentContext(profilePath, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1400, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(START_URLS[platform], { waitUntil: "domcontentloaded" });

  await context.waitForEvent("close", { timeout: 0 }).catch(() => undefined);
  await context.close();
  console.log("Session saved.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
