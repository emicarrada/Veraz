import type { Page } from "playwright";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

async function openInstagramCreateFlow(page: Page): Promise<void> {
  const createLink = page.locator('a[href="/create/select/"], a[href*="/create/select/"]');

  const createVisible = await createLink
    .first()
    .isVisible({ timeout: 12_000 })
    .catch(() => false);

  if (createVisible) {
    await createLink.first().click({ timeout: 15_000 });
    await page.waitForTimeout(1200);

    const publicacionItem = page
      .getByRole("link", { name: /^Publicación$/i })
      .or(page.getByRole("link", { name: /^Post$/i }))
      .or(page.locator('a[href*="/create/"]').filter({ hasText: /^Publicación$/i }));

    await publicacionItem.first().click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    return;
  }

  await page.goto("https://www.instagram.com/create/select/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(1500);
}

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
    await fileInput.waitFor({ state: "attached", timeout: 30_000 });
    await fileInput.setInputFiles(input.imagePath, { timeout: 45_000 });
    await page.waitForTimeout(2500);

    const nextButton = page.getByRole("button", { name: /^Siguiente$|^Next$/i });
    for (let step = 0; step < 2; step += 1) {
      try {
        const btn = nextButton.first();
        if (await btn.isVisible({ timeout: 5000 })) {
          await btn.click({ timeout: 12_000 });
          await page.waitForTimeout(1800);
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
    await captionField.waitFor({ state: "visible", timeout: 30_000 });
    await captionField.click();
    await captionField.fill(input.caption);

    const shareButton = page.getByRole("button", { name: /^Compartir$|^Share$/i }).first();
    await shareButton.waitFor({ state: "visible", timeout: 25_000 });
    await shareButton.click({ timeout: 25_000 });
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
