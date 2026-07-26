import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

/**
 * Auto-post to X using a logged-in Chrome profile (`npm run social:login -- x`).
 */
export async function publishToX(input: SocialNetworkPublishInput): Promise<SocialPublishResult> {
  if (!input.imagePath) {
    return { ok: false, error: "Falta imagePath para X." };
  }
  let context;
  try {
    context = await launchSocialBrowser(input.profileDir, input.headed);
    const page = context.pages()[0] ?? (await context.newPage());

    await page.goto("https://x.com/compose/post", { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(2500);
    await dismissCommonDialogs(page);

    if (page.url().includes("/login") || page.url().includes("/i/flow/login")) {
      return { ok: false, error: "X pide login de nuevo. Ejecuta: npm run social:login -- x" };
    }

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 20_000 });
    await fileInput.setInputFiles(input.imagePath, { timeout: 45_000 });
    await page.waitForTimeout(2000);

    const editor = page
      .locator('[data-testid="tweetTextarea_0"], div[contenteditable="true"][role="textbox"]')
      .first();
    await editor.waitFor({ state: "visible", timeout: 20_000 });
    await editor.click();
    await editor.fill(input.caption);

    const postButton = page
      .locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]')
      .filter({ hasNot: page.locator("[disabled]") })
      .first();
    await postButton.waitFor({ state: "visible", timeout: 15_000 });
    await postButton.click({ timeout: 20_000 });
    await page.waitForTimeout(5000);

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (input.headed && input.pauseOnErrorMs) {
      await new Promise((resolve) => setTimeout(resolve, input.pauseOnErrorMs));
    }
    return { ok: false, error: message };
  } finally {
    await context?.close();
  }
}
