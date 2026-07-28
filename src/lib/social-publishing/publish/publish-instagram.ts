import path from "node:path";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  advanceInstagramPostWizard,
  assertInstagramUploadContext,
  clickInstagramShare,
  fillInstagramCaption,
  openFreshInstagramPage,
  openInstagramCreateFlow,
} from "@/lib/social-publishing/publish/instagram-create-flow";
import {
  captureInstagramDebugStep,
  verifyInstagramFeedOrReelShared,
} from "@/lib/social-publishing/publish/instagram-publish-debug";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

const EXPORTS_DIR = process.env.SOCIAL_EXPORTS_DIR?.trim() || ".social/exports";
const DEBUG_SCREENSHOT = ".social/exports/instagram-feed-last-attempt.png";

/**
 * Auto-post to Instagram feed (web). Requires prior login: npm run social:login -- instagram
 */
export async function publishToInstagram(input: SocialNetworkPublishInput): Promise<SocialPublishResult> {
  if (!input.imagePath) {
    return { ok: false, error: "Falta imagePath para Instagram feed." };
  }
  let context;
  try {
    context = await launchSocialBrowser(input.profileDir, input.headed);
    const page = await openFreshInstagramPage(context);

    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(3000);
    await dismissCommonDialogs(page);
    await captureInstagramDebugStep(page, "feed-after-home", EXPORTS_DIR);

    await assertInstagramUploadContext(page);
    await openInstagramCreateFlow(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(input.imagePath, { timeout: 45_000 });
    await page.waitForTimeout(2500);
    await captureInstagramDebugStep(page, "feed-after-file-set", EXPORTS_DIR);

    await advanceInstagramPostWizard(page, 2);
    await captureInstagramDebugStep(page, "feed-after-wizard", EXPORTS_DIR);
    await fillInstagramCaption(page, input.caption);
    await captureInstagramDebugStep(page, "feed-before-share", EXPORTS_DIR);
    await clickInstagramShare(page);
    await page.waitForTimeout(5000);

    const verified = await verifyInstagramFeedOrReelShared(page);
    if (!verified.ok) {
      await page.screenshot({ path: path.resolve(DEBUG_SCREENSHOT), fullPage: true }).catch(() => undefined);
      await captureInstagramDebugStep(page, "feed-verify-failed", EXPORTS_DIR);
      return {
        ok: false,
        error: `No hubo confirmación de publicación en Instagram feed. ${verified.hint}`,
      };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      const page = context?.pages()[0];
      if (page) {
        await page.screenshot({ path: path.resolve(DEBUG_SCREENSHOT), fullPage: true }).catch(() => undefined);
        await captureInstagramDebugStep(page, "feed-error", EXPORTS_DIR);
      }
    } catch {
      /* ignore */
    }
    if (input.headed && input.pauseOnErrorMs) {
      await new Promise((resolve) => setTimeout(resolve, input.pauseOnErrorMs));
    }
    return {
      ok: false,
      error: `${message}. Modo ver: npm run social:watch:instagram — capturas en .social/exports/instagram-debug-*`,
    };
  } finally {
    await context?.close();
  }
}
