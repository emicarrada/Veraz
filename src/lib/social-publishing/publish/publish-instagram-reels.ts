import type { Page } from "playwright";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

async function openInstagramReelCreate(page: Page): Promise<void> {
  await page.goto("https://www.instagram.com/create/reel/", {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForTimeout(2000);

  if (!page.url().includes("/create/reel")) {
    const createLink = page
      .getByRole("link", { name: /^Crear$/i })
      .or(page.getByRole("link", { name: /^Create$/i }));
    if (await createLink.first().isVisible({ timeout: 8000 }).catch(() => false)) {
      await createLink.first().click({ timeout: 15_000 });
      await page.waitForTimeout(1200);
      const reelItem = page
        .getByRole("link", { name: /^Reel$/i })
        .or(page.getByRole("link", { name: /^Reels$/i }));
      await reelItem.first().click({ timeout: 15_000 });
      await page.waitForTimeout(1500);
    }
  }
}

/**
 * Instagram Reels (web). Same session as feed: npm run social:login -- instagram
 */
export async function publishToInstagramReels(
  input: SocialNetworkPublishInput,
): Promise<SocialPublishResult> {
  if (!input.videoPath) {
    return { ok: false, error: "Falta videoPath para Instagram Reels." };
  }

  let context;
  try {
    context = await launchSocialBrowser(input.profileDir, input.headed);
    const page = context.pages()[0] ?? (await context.newPage());

    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(2500);
    await dismissCommonDialogs(page);

    if (page.url().includes("/accounts/login")) {
      return {
        ok: false,
        error: "Instagram pide login. Ejecuta: npm run social:login -- instagram",
      };
    }

    await openInstagramReelCreate(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 35_000 });
    await fileInput.setInputFiles(input.videoPath, { timeout: 120_000 });
    await page.waitForTimeout(3500);

    const nextButton = page.getByRole("button", { name: /^Siguiente$|^Next$/i });
    for (let step = 0; step < 3; step += 1) {
      try {
        const btn = nextButton.first();
        if (await btn.isVisible({ timeout: 4000 })) {
          await btn.click({ timeout: 12_000 });
          await page.waitForTimeout(2000);
        }
      } catch {
        break;
      }
    }

    const captionField = page
      .locator(
        'textarea[aria-label*="caption" i], textarea[aria-label*="Escribe" i], div[contenteditable="true"][role="textbox"]',
      )
      .first();
    await captionField.waitFor({ state: "visible", timeout: 35_000 });
    await captionField.click();
    await captionField.fill(input.caption);

    const shareButton = page
      .getByRole("button", { name: /^Compartir$|^Share$/i })
      .or(page.getByRole("button", { name: /^Publicar$|^Publish$/i }))
      .first();
    await shareButton.waitFor({ state: "visible", timeout: 30_000 });
    await shareButton.click({ timeout: 30_000 });
    await page.waitForTimeout(10_000);

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (input.headed && input.pauseOnErrorMs) {
      await new Promise((resolve) => setTimeout(resolve, input.pauseOnErrorMs));
    }
    return {
      ok: false,
      error: `${message}. Prueba SOCIAL_HEADED=true o npm run social:login -- instagram`,
    };
  } finally {
    await context?.close();
  }
}
