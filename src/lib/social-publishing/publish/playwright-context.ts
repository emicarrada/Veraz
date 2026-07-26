import { access } from "node:fs/promises";
import path from "node:path";

import { chromium, type BrowserContext } from "playwright";

import type { SocialPlatform } from "@/features/social-publishing/types";

export async function launchSocialBrowser(
  profileDir: string,
  headed: boolean,
): Promise<BrowserContext> {
  const profilePath = path.resolve(profileDir);
  return chromium.launchPersistentContext(profilePath, {
    channel: "chrome",
    headless: !headed,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });
}

export async function assertSocialProfileReady(
  profileDir: string,
  platform: SocialPlatform,
): Promise<string | null> {
  const resolved = path.resolve(profileDir);
  try {
    await access(path.join(resolved, "Default"));
    return null;
  } catch {
    return `Sin sesión de ${platform}. Ejecuta una vez: npm run social:login -- ${platform}`;
  }
}

export async function dismissCommonDialogs(page: import("playwright").Page): Promise<void> {
  const candidates = [
    page.getByRole("button", { name: /aceptar|accept|allow all|permitir|agree|ok/i }),
    page.locator('button:has-text("Not Now")'),
    page.locator('button:has-text("Ahora no")'),
  ];
  for (const locator of candidates) {
    try {
      if (await locator.first().isVisible({ timeout: 1500 })) {
        await locator.first().click({ timeout: 3000 });
      }
    } catch {
      // optional dismiss
    }
  }
}
