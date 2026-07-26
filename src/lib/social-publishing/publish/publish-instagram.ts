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
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

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

    await assertInstagramUploadContext(page);
    await openInstagramCreateFlow(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 30_000 });
    await fileInput.setInputFiles(input.imagePath, { timeout: 45_000 });
    await page.waitForTimeout(2500);

    await advanceInstagramPostWizard(page, 2);
    await fillInstagramCaption(page, input.caption);
    await clickInstagramShare(page);
    await page.waitForTimeout(8000);

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (input.headed && input.pauseOnErrorMs) {
      await new Promise((resolve) => setTimeout(resolve, input.pauseOnErrorMs));
    }
    return {
      ok: false,
      error: `${message}. Prueba SOCIAL_HEADED=true o vuelve a npm run social:login -- instagram`,
    };
  } finally {
    await context?.close();
  }
}
