import path from "node:path";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  clickInstagramShare,
  fillInstagramCaption,
  openInstagramCreateFlow,
  waitForInstagramCaptionScreen,
} from "@/lib/social-publishing/publish/instagram-create-flow";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

const DEBUG_SCREENSHOT = ".social/exports/reels-last-attempt.png";

/**
 * Instagram Reels vía publicación normal (MP4): IG trata el video vertical como Reel.
 * Misma sesión que feed: npm run social:login -- instagram
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
    await page.waitForTimeout(3000);
    await dismissCommonDialogs(page);

    if (page.url().includes("/accounts/login")) {
      return {
        ok: false,
        error: "Instagram pide login. Ejecuta: npm run social:login -- instagram",
      };
    }

    await openInstagramCreateFlow(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 45_000 });
    await fileInput.setInputFiles(input.videoPath, { timeout: 120_000 });
    await page.waitForTimeout(8000);

    await waitForInstagramCaptionScreen(page, 120_000);
    await fillInstagramCaption(page, input.caption);
    await clickInstagramShare(page);
    await page.waitForTimeout(10_000);

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      const page = context?.pages()[0];
      if (page) {
        await page.screenshot({ path: path.resolve(DEBUG_SCREENSHOT), fullPage: true }).catch(() => undefined);
      }
    } catch {
      /* ignore */
    }
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
