import path from "node:path";

import type { Page } from "playwright";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";
import {
  dismissCommonDialogs,
  launchSocialBrowser,
} from "@/lib/social-publishing/publish/playwright-context";
import {
  acceptTikTokPublishTerms,
  captureTikTokDebugStep,
  describeBlockingUi,
  dismissTikTokStudioModals,
  saveTopmostDialogArtifacts,
} from "@/lib/social-publishing/publish/tiktok-studio-modals";

const UPLOAD_URL = "https://www.tiktok.com/tiktokstudio/upload?lang=es";
const EXPORTS_DIR = ".social/exports";

function log(step: string): void {
  console.log(`[tiktok] ${step}`);
}

async function debugStep(page: Page, step: string): Promise<void> {
  await captureTikTokDebugStep(page, step, EXPORTS_DIR);
}

async function fillTikTokCaption(page: Page, caption: string): Promise<void> {
  await dismissTikTokStudioModals(page);
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

async function waitForContentChecksReady(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => {
        const text = document.body?.innerText ?? "";
        return (
          /no se detectaron problemas|no se encontraron problemas|no issues found|no problems detected/i.test(
            text,
          ) && !/comprobando|checking/i.test(text)
        );
      },
      { timeout: 120_000 },
    )
    .catch(() => undefined);
}

async function clickPrimaryPublishButton(page: Page): Promise<boolean> {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => undefined);
  await page.waitForTimeout(600);

  return page
    .evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button")) as HTMLButtonElement[];
      const candidates = buttons.filter((b) => /^publicar$|^post$/i.test(b.textContent?.trim() ?? ""));
      for (let i = candidates.length - 1; i >= 0; i -= 1) {
        const btn = candidates[i]!;
        if (btn.disabled) continue;
        const rect = btn.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) continue;
        btn.scrollIntoView({ block: "center", inline: "center" });
        btn.click();
        return true;
      }
      return false;
    })
    .catch(() => false);
}

async function clickPublishWithConfirm(page: Page): Promise<void> {
  await dismissTikTokStudioModals(page);
  await acceptTikTokPublishTerms(page);
  await waitForContentChecksReady(page);

  const footerPublish = page.getByRole("button", { name: /^Publicar$|^Post$/i });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await dismissTikTokStudioModals(page);
    await waitForPostButtonReady(page);

    let clicked = await clickPrimaryPublishButton(page);
    if (!clicked) {
      const btn = footerPublish.last();
      await btn.scrollIntoViewIfNeeded().catch(() => undefined);
      await btn.waitFor({ state: "visible", timeout: 40_000 });
      await btn.click({ timeout: 25_000, force: true });
      clicked = true;
    }

    if (clicked) log("Clic en Publicar enviado…");
    await page.waitForTimeout(3500);
    await dismissTikTokStudioModals(page);

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
    log(`Reintentando Publicar (intento ${attempt + 2}/3, sigue en subida)…`);
  }
}

type VerifyResult = { ok: true } | { ok: false; hint: string | null };

async function verifyTikTokPublished(page: Page): Promise<VerifyResult> {
  await dismissTikTokStudioModals(page);

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

  if (handle) return { ok: true };

  const hint = await describeBlockingUi(page);
  return { ok: false, hint };
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
    await dismissTikTokStudioModals(page);
    await debugStep(page, "after-goto");

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
    await debugStep(page, "after-upload");

    log("Esperando que TikTok procese el video (hasta 3 min)…");
    await page.waitForTimeout(4000);
    await dismissTikTokStudioModals(page);
    await waitForPostButtonReady(page);
    await debugStep(page, "after-processing");

    log("Escribiendo caption…");
    await dismissTikTokStudioModals(page);
    await fillTikTokCaption(page, input.caption);
    await page.waitForTimeout(1000);
    await dismissTikTokStudioModals(page);
    await debugStep(page, "before-publish");

    log("Publicando…");
    await clickPublishWithConfirm(page);
    await debugStep(page, "after-publish");

    log("Verificando que TikTok aceptó el video…");
    await dismissTikTokStudioModals(page);
    await debugStep(page, "before-verify");
    const verified = await verifyTikTokPublished(page);

    if (!verified.ok) {
      const debugPath = path.join(EXPORTS_DIR, "tiktok-last-attempt.png");
      await page.screenshot({ path: debugPath, fullPage: true }).catch(() => undefined);
      await saveTopmostDialogArtifacts(page, EXPORTS_DIR, "verify-failed");
      await debugStep(page, "verify-failed");

      const dialogHint = verified.hint ? ` UI bloqueante: ${verified.hint}` : "";
      return {
        ok: false,
        error: `No hubo confirmación de publicación en TikTok.${dialogHint} Revisa ${debugPath} y tiktok-debug-*.txt (SOCIAL_TIKTOK_DEBUG=1) o TikTok Studio → Contenido.`,
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
