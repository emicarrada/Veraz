import type { Page } from "playwright";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";

const UPLOAD_URL = "https://www.tiktok.com/tiktokstudio/upload?lang=es";

function log(step: string): void {
  console.log(`[tiktok] ${step}`);
}

async function dismissTikTokModals(page: Page): Promise<void> {
  await page
    .evaluate(() => {
      document.querySelectorAll("#react-joyride-portal, .react-joyride__overlay").forEach((el) => el.remove());
      document
        .querySelectorAll('[class*="TUXModal-overlay"], [class*="TUXModal"]')
        .forEach((el) => el.remove());
    })
    .catch(() => undefined);

  const skipTour = page.getByRole("button", { name: /skip|omitir|saltar|close|cerrar|got it|entendido/i });
  if (await skipTour.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipTour.first().click({ force: true, timeout: 5000 }).catch(() => undefined);
  }

  const closeModal = page
    .locator('[class*="TUXModal"] button, [class*="modal-desc"] button')
    .filter({ hasText: /got it|entendido|ok|aceptar|continuar|not now|ahora no|allow|permitir/i });

  for (let i = 0; i < 4; i += 1) {
    const overlayVisible = await page
      .locator('[class*="TUXModal-overlay"], [class*="modal-desc"], .react-joyride__overlay')
      .first()
      .isVisible({ timeout: 800 })
      .catch(() => false);

    if (!overlayVisible) break;

    try {
      if (await closeModal.first().isVisible({ timeout: 800 })) {
        await closeModal.first().click({ timeout: 6000, force: true });
      } else {
        await page.locator('[class*="TUXModal"] button').first().click({ force: true, timeout: 4000 });
      }
    } catch {
      await page.keyboard.press("Escape").catch(() => undefined);
    }

    await page
      .evaluate(() => {
        document.querySelectorAll("#react-joyride-portal, .react-joyride__overlay").forEach((el) => el.remove());
        document
          .querySelectorAll('[class*="TUXModal-overlay"], [class*="TUXModal"]')
          .forEach((el) => el.remove());
      })
      .catch(() => undefined);

    await page.waitForTimeout(400);
  }
}

async function fillTikTokCaption(page: Page, caption: string): Promise<void> {
  await dismissTikTokModals(page);
  const captionField = page
    .locator(
      'div[contenteditable="true"], textarea[placeholder*="caption" i], textarea[placeholder*="descrip" i]',
    )
    .first();
  await captionField.waitFor({ state: "visible", timeout: 60_000 });

  const filled = await page
    .evaluate((text) => {
      const el = document.querySelector(
        'div[contenteditable="true"][role="combobox"], div.public-DraftEditor-content[contenteditable="true"], div[contenteditable="true"]',
      ) as HTMLElement | null;
      if (!el) return false;
      el.focus();
      el.textContent = text;
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      return true;
    }, caption)
    .catch(() => false);

  if (!filled) {
    await captionField.click({ timeout: 15_000, force: true });
    await captionField.fill(caption);
  }
}

async function waitForPostButtonReady(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const post = buttons.find((b) => /^(publicar|post|publicar ahora|post now)$/i.test(b.textContent?.trim() ?? ""));
        return Boolean(post && !(post as HTMLButtonElement).disabled);
      },
      { timeout: 180_000 },
    )
    .catch(() => undefined);
}

async function acceptTikTokPublishTerms(page: Page): Promise<void> {
  const terms = page.locator('input[type="checkbox"]').first();
  if (await terms.isVisible({ timeout: 2000 }).catch(() => false)) {
    const checked = await terms.isChecked().catch(() => true);
    if (!checked) {
      await terms.check({ force: true }).catch(() => undefined);
    }
  }
}

async function clickPublishWithConfirm(page: Page): Promise<void> {
  await dismissTikTokModals(page);
  await acceptTikTokPublishTerms(page);

  const footerPublish = page
    .getByRole("button", { name: /^Publicar$|^Post$/i })
    .filter({ hasNot: page.locator("[disabled]") });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await dismissTikTokModals(page);
    const btn = footerPublish.last();
    await btn.scrollIntoViewIfNeeded().catch(() => undefined);
    await btn.waitFor({ state: "visible", timeout: 40_000 });
    await btn.click({ timeout: 25_000, force: true });
    await page.waitForTimeout(3500);
    await dismissTikTokModals(page);

    const confirmButton = page
      .locator("button")
      .filter({ hasText: /^Publicar ahora$|^Post now$|^Confirmar$|^Confirm$/i });
    if (await confirmButton.first().isVisible({ timeout: 12_000 }).catch(() => false)) {
      log("Confirmando publicación (segundo diálogo)…");
      await confirmButton.first().click({ timeout: 20_000, force: true });
      await page.waitForTimeout(4000);
    }

    const stillOnUpload = /\/upload/i.test(page.url());
    const publishVisible = await footerPublish
      .last()
      .isVisible({ timeout: 1500 })
      .catch(() => false);
    if (!stillOnUpload || !publishVisible) {
      return;
    }
    log("Reintentando Publicar (sigue en pantalla de subida)…");
  }
}

async function verifyTikTokPublished(page: Page): Promise<boolean> {
  const handle = await page
    .waitForFunction(
      () => {
        const url = window.location.href;
        const text = document.body?.innerText ?? "";
        if (/\/tiktokstudio\/content|manage\/post/i.test(url)) return true;
        if (
          /uploaded successfully|video published|publicado|subiendo|being uploaded|manage your posts|video is being processed|procesando|subido con éxito|publicación programada/i.test(
            text,
          )
        ) {
          return true;
        }
        if (/ya puedes ver|view your post|ver tu video|content uploaded/i.test(text)) {
          return true;
        }
        const stillOnUpload = /\/upload/i.test(url);
        const postStillVisible = Array.from(document.querySelectorAll("button")).some((b) =>
          /^(publicar|post)$/i.test(b.textContent?.trim() ?? ""),
        );
        return !stillOnUpload && !postStillVisible;
      },
      { timeout: 90_000 },
    )
    .catch(() => null);

  return Boolean(handle);
}

/**
 * TikTok Studio upload (web). Prior login: npm run social:login -- tiktok
 */
export async function publishToTikTok(input: SocialNetworkPublishInput): Promise<SocialPublishResult> {
  if (!input.videoPath) {
    return { ok: false, error: "Falta videoPath para TikTok." };
  }

  let context;
  try {
    log("Abriendo Chrome…");
    context = await launchSocialBrowser(input.profileDir, input.headed);
    const page = context.pages()[0] ?? (await context.newPage());

    log("Cargando TikTok Studio…");
    await page.goto(UPLOAD_URL, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(2500);
    await dismissCommonDialogs(page);
    await dismissTikTokModals(page);

    if (page.url().includes("/login")) {
      return {
        ok: false,
        error: "TikTok pide login. Ejecuta: npm run social:login -- tiktok",
      };
    }

    log("Adjuntando MP4…");
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 40_000 });
    await fileInput.setInputFiles(input.videoPath, { timeout: 120_000 });

    log("Esperando que TikTok procese el video (hasta 3 min)…");
    await page.waitForTimeout(4000);
    await dismissTikTokModals(page);
    await waitForPostButtonReady(page);

    log("Escribiendo caption…");
    await fillTikTokCaption(page, input.caption);
    await page.waitForTimeout(1000);
    await dismissTikTokModals(page);

    log("Publicando…");
    await clickPublishWithConfirm(page);

    log("Verificando que TikTok aceptó el video…");
    const published = await verifyTikTokPublished(page);
    if (!published) {
      const debugPath = ".social/exports/tiktok-last-attempt.png";
      await page.screenshot({ path: debugPath, fullPage: true }).catch(() => undefined);
      return {
        ok: false,
        error: `No hubo confirmación de publicación en TikTok. Revisa ${debugPath} con SOCIAL_HEADED=true o en TikTok Studio → Contenido.`,
      };
    }

    log("Publicado (confirmado por TikTok Studio).");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (input.headed && input.pauseOnErrorMs) {
      await new Promise((resolve) => setTimeout(resolve, input.pauseOnErrorMs));
    }
    return {
      ok: false,
      error: `${message}. Prueba SOCIAL_HEADED=true o npm run social:login -- tiktok`,
    };
  } finally {
    await context?.close();
  }
}
