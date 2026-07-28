import type { Page } from "playwright";

import { captureInstagramDebugStep } from "@/lib/social-publishing/publish/instagram-publish-debug";

const EXPORTS_DIR = process.env.SOCIAL_EXPORTS_DIR?.trim() || ".social/exports";

const CREATE_PROFILE = /instagram\.com\/create\/?(\?|$)/i;

export function isInstagramCreateProfileUrl(url: string): boolean {
  return CREATE_PROFILE.test(url);
}

/** Reuse one tab; persistent Chrome cannot open a tab after closing the last one. */
export async function openFreshInstagramPage(context: import("playwright").BrowserContext): Promise<Page> {
  const pages = context.pages();
  for (const extra of pages.slice(1)) {
    await extra.close().catch(() => undefined);
  }
  if (pages[0]) {
    return pages[0];
  }
  return context.newPage();
}

async function debugSnap(page: Page, step: string): Promise<void> {
  await captureInstagramDebugStep(page, step, EXPORTS_DIR);
}

export async function assertInstagramUploadContext(page: Page): Promise<void> {
  const url = page.url();
  if (url.includes("/accounts/login")) {
    throw new Error("Instagram pide login. Ejecuta: npm run social:login -- instagram");
  }
  if (isInstagramCreateProfileUrl(url)) {
    throw new Error(
      "Instagram abrió el perfil @create (/create/) en lugar del flujo Crear → Publicación. Re-login o sync de perfil.",
    );
  }

  const expectedUser = process.env.SOCIAL_INSTAGRAM_USERNAME?.trim().replace(/^@/, "");
  if (expectedUser) {
    const onProfile = await page
      .evaluate((user) => {
        const link = document.querySelector(`a[href="/${user}/"], a[href="/${user}"]`);
        return Boolean(link);
      }, expectedUser.toLowerCase())
      .catch(() => true);
    if (!onProfile && isInstagramCreateProfileUrl(page.url())) {
      throw new Error(`Sesión Instagram no coincide con @${expectedUser}.`);
    }
  }
}

async function openCreateSelect(page: Page): Promise<void> {
  const createNav = page
    .locator(
      'a[href="/create/select/"], a[href*="/create/select"], [aria-label="New post"], [aria-label="Nueva publicación"], [aria-label="Create"], [aria-label="Crear"]',
    )
    .first();

  if (await createNav.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await createNav.click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    return;
  }

  await page.goto("https://www.instagram.com/create/select/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(1500);
}

async function openPostComposerFromSelect(page: Page): Promise<void> {
  const styleLink = page.locator('a[href="/create/style/"], a[href*="/create/style/"]').first();
  if (await styleLink.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await styleLink.click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    return;
  }

  const publicacionItem = page
    .getByRole("link", { name: /^(Publicación|Post|Create new post)$/i })
    .or(page.getByRole("button", { name: /^(Publicación|Post)$/i }))
    .or(page.locator('a[href*="/create/style"]'))
    .or(page.getByText(/^Publicación$|^Post$/i));

  const clicked = await publicacionItem
    .first()
    .click({ timeout: 12_000 })
    .then(() => true)
    .catch(() => false);

  if (clicked) {
    await page.waitForTimeout(1500);
    return;
  }

  await debugSnap(page, "ig-fallback-goto-style");
  await page.goto("https://www.instagram.com/create/style/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(1500);
}

/** Crear → Publicación (evita enlaces al perfil @create). */
export async function openInstagramCreateFlow(page: Page): Promise<void> {
  await debugSnap(page, "ig-before-create");

  await openCreateSelect(page);
  await debugSnap(page, "ig-create-select");
  await assertInstagramUploadContext(page);

  await openPostComposerFromSelect(page);
  await debugSnap(page, "ig-after-create-flow");
  await assertInstagramUploadContext(page);

  await page
    .locator('input[type="file"]')
    .first()
    .waitFor({ state: "attached", timeout: 25_000 })
    .catch(async () => {
      await debugSnap(page, "ig-no-file-input");
      throw new Error(
        "No apareció el selector de archivo tras Crear → Publicación. Revisa instagram-debug-*.png en .social/exports/",
      );
    });
}

export async function waitForInstagramVideoProcessing(page: Page, timeoutMs = 180_000): Promise<void> {
  await page
    .waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const next = buttons.find((b) => /^(siguiente|next)$/i.test(b.textContent?.trim() ?? ""));
        return Boolean(next && !(next as HTMLButtonElement).disabled);
      },
      { timeout: timeoutMs },
    )
    .catch(() => undefined);
}

export async function advanceInstagramPostWizard(page: Page, maxSteps: number): Promise<void> {
  const nextButton = page.getByRole("button", {
    name: /^Siguiente$|^Next$|^OK$|^Listo$|^Done$|^Continuar$|^Continue$|^Recortar$|^Crop$/i,
  });
  for (let step = 0; step < maxSteps; step += 1) {
    try {
      const btn = nextButton.first();
      if (await btn.isVisible({ timeout: 5000 })) {
        await btn.click({ timeout: 12_000 });
        await page.waitForTimeout(step === 0 ? 3500 : 1800);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

function instagramCaptionLocator(page: Page) {
  return page.locator(
    'textarea[aria-label*="caption" i], textarea[aria-label*="Escribe" i], textarea[aria-label*="descripción" i], div[contenteditable="true"][role="textbox"]',
  );
}

export async function waitForInstagramCaptionScreen(page: Page, timeoutMs = 120_000): Promise<void> {
  const caption = instagramCaptionLocator(page).first();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await caption.isVisible({ timeout: 1500 }).catch(() => false)) {
      return;
    }
    await advanceInstagramPostWizard(page, 1);
    await page.waitForTimeout(2500);
  }

  await caption.waitFor({ state: "visible", timeout: 5000 });
}

export async function fillInstagramCaption(page: Page, caption: string): Promise<void> {
  const captionField = instagramCaptionLocator(page).first();
  await captionField.waitFor({ state: "visible", timeout: 60_000 });
  await captionField.click();
  await captionField.fill(caption);
}

export async function clickInstagramShare(page: Page): Promise<void> {
  const shareButton = page
    .getByRole("button", { name: /^Compartir$|^Share$/i })
    .or(page.getByRole("button", { name: /^Publicar$|^Publish$/i }))
    .first();
  await shareButton.waitFor({ state: "visible", timeout: 30_000 });
  await shareButton.click({ timeout: 30_000 });
}
