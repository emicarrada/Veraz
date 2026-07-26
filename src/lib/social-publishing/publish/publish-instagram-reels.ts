import path from "node:path";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  assertInstagramUploadContext,
  clickInstagramShare,
  fillInstagramCaption,
  openFreshInstagramPage,
  openInstagramCreateFlow,
  waitForInstagramCaptionScreen,
  waitForInstagramVideoProcessing,
} from "@/lib/social-publishing/publish/instagram-create-flow";
import {
  captureInstagramDebugStep,
  verifyInstagramFeedOrReelShared,
} from "@/lib/social-publishing/publish/instagram-publish-debug";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

const EXPORTS_DIR = ".social/exports";
const DEBUG_SCREENSHOT = ".social/exports/reels-last-attempt.png";

/**
 * Instagram Reels vía publicación normal (MP4): IG trata el video vertical como Reel.
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
    const page = await openFreshInstagramPage(context);

    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(3000);
    await dismissCommonDialogs(page);
    await captureInstagramDebugStep(page, "after-home", EXPORTS_DIR);

    await assertInstagramUploadContext(page);

    await openInstagramCreateFlow(page);
    await captureInstagramDebugStep(page, "after-create-flow", EXPORTS_DIR);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 45_000 });
    await fileInput.setInputFiles(input.videoPath, { timeout: 120_000 });
    await page.waitForTimeout(3000);
    await captureInstagramDebugStep(page, "after-file-set", EXPORTS_DIR);

    await waitForInstagramVideoProcessing(page, 180_000);
    await waitForInstagramCaptionScreen(page, 120_000);
    await captureInstagramDebugStep(page, "after-wizard", EXPORTS_DIR);

    await fillInstagramCaption(page, input.caption);
    await captureInstagramDebugStep(page, "before-share", EXPORTS_DIR);
    await clickInstagramShare(page);
    await page.waitForTimeout(5000);

    const verified = await verifyInstagramFeedOrReelShared(page);
    if (!verified.ok) {
      await page.screenshot({ path: path.resolve(DEBUG_SCREENSHOT), fullPage: true }).catch(() => undefined);
      await captureInstagramDebugStep(page, "verify-failed", EXPORTS_DIR);
      return {
        ok: false,
        error: `No hubo confirmación de publicación en Instagram Reels. ${verified.hint}`,
      };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      const page = context?.pages()[0];
      if (page) {
        await page.screenshot({ path: path.resolve(DEBUG_SCREENSHOT), fullPage: true }).catch(() => undefined);
        await captureInstagramDebugStep(page, "verify-failed", EXPORTS_DIR);
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
