import type { Page } from "playwright";
import path from "node:path";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

const DEBUG_SCREENSHOT = ".social/exports/reels-last-attempt.png";

async function advanceReelEditorSteps(page: Page): Promise<void> {
  for (let step = 0; step < 6; step += 1) {
    await dismissCommonDialogs(page);
    let clicked = false;
    for (const name of [/^Siguiente$|^Next$/i, /^OK$|^Listo$|^Done$/i, /^Continuar$|^Continue$/i]) {
      const btn = page.getByRole("button", { name }).first();
      if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await btn.click({ timeout: 12_000 }).catch(() => undefined);
        clicked = true;
        await page.waitForTimeout(2200);
        break;
      }
    }
    if (!clicked) break;
  }
}

async function fillReelCaption(page: Page, caption: string): Promise<void> {
  await dismissCommonDialogs(page);

  const captionField = page
    .locator(
      [
        'textarea[aria-label*="caption" i]',
        'textarea[aria-label*="Escribe" i]',
        'textarea[placeholder*="caption" i]',
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"][aria-label*="caption" i]',
        'div[contenteditable="true"]',
      ].join(", "),
    )
    .first();

  await captionField.waitFor({ state: "visible", timeout: 60_000 });

  const filled = await page
    .evaluate((text) => {
      const el = document.querySelector(
        'textarea[aria-label*="caption" i], textarea[aria-label*="Escribe" i], div[contenteditable="true"][role="textbox"], div[contenteditable="true"]',
      ) as HTMLTextAreaElement | HTMLElement | null;
      if (!el) return false;
      el.focus();
      if ("value" in el) {
        (el as HTMLTextAreaElement).value = text;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        el.textContent = text;
        el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      }
      return true;
    }, caption)
    .catch(() => false);

  if (!filled) {
    await captionField.click({ force: true });
    await captionField.fill(caption);
  }
}

/** Sidebar "new post" — must not match profile links like instagram.com/create (@create). */
function instagramCreateSelectNav(page: Page) {
  return page.locator('a[href="/create/select/"], a[href*="/create/select/"]');
}

function instagramReelCreateLink(page: Page) {
  return page.locator('a[href="/create/reel/"], a[href*="/create/reel"]');
}

async function openInstagramReelCreate(page: Page): Promise<void> {
  const createNav = instagramCreateSelectNav(page);
  if (await createNav.first().isVisible({ timeout: 8000 }).catch(() => false)) {
    await createNav.first().click({ timeout: 15_000 });
    await page.waitForTimeout(1200);
    await instagramReelCreateLink(page).first().click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    return;
  }

  const createLink = page
    .getByRole("link", { name: /^Crear$/i })
    .or(page.getByRole("link", { name: /^Create$/i }));
  if (await createLink.first().isVisible({ timeout: 8000 }).catch(() => false)) {
    await createLink.first().click({ timeout: 15_000 });
    await page.waitForTimeout(1200);
    await instagramReelCreateLink(page).first().click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    return;
  }

  await page.goto("https://www.instagram.com/create/select/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(1200);
  await instagramReelCreateLink(page).first().click({ timeout: 15_000 });
  await page.waitForTimeout(1500);
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
    await page.waitForTimeout(5000);
    await advanceReelEditorSteps(page);

    await fillReelCaption(page, input.caption);

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
