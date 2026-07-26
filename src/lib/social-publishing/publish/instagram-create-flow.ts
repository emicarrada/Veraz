import type { Page } from "playwright";

/** Crear → Publicación (evita enlaces al perfil @create). */
export async function openInstagramCreateFlow(page: Page): Promise<void> {
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

  const publicacionItem = page
    .getByRole("link", { name: /^Publicación$/i })
    .or(page.getByRole("link", { name: /^Post$/i }))
    .or(page.locator('a[href*="/create/style"]').filter({ hasText: /^Publicación$/i }));

  if (await publicacionItem.first().isVisible({ timeout: 10_000 }).catch(() => false)) {
    await publicacionItem.first().click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
  }
}

export async function advanceInstagramPostWizard(page: Page, maxSteps: number): Promise<void> {
  const nextButton = page.getByRole("button", {
    name: /^Siguiente$|^Next$|^OK$|^Listo$|^Done$|^Continuar$|^Continue$|^Recortar$/i,
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
    'textarea[aria-label*="caption" i], textarea[aria-label*="Escribe" i], div[contenteditable="true"][role="textbox"]',
  );
}

/** Tras subir video, IG puede tardar en recorte/filtros antes del caption. */
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
