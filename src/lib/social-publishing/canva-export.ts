import { access, mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium, type Page } from "playwright";

import type { SocialPublishConfig } from "@/features/social-publishing/types";

export type CanvaExportInput = {
  templateUrl: string;
  profileDir: string;
  title: string;
  sourceLabel: string;
  localImagePath: string;
  exportPath: string;
  headed: boolean;
  /** When headed, wait before closing on error so you can inspect Canva. */
  pauseOnErrorMs?: number;
};

export type CanvaExportResult =
  | { ok: true; exportPath: string }
  | { ok: false; error: string };

const EDITOR_TIMEOUT_MS = 120_000;
const STEP_TIMEOUT_MS = 45_000;

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function clickFirstMatchingButton(page: Page, patterns: RegExp[]): Promise<boolean> {
  for (const pattern of patterns) {
    const button = page.getByRole("button", { name: pattern }).first();
    if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
      await button.click({ timeout: STEP_TIMEOUT_MS });
      return true;
    }
  }
  return false;
}

async function openTemplateInEditor(page: Page, templateUrl: string): Promise<void> {
  await page.goto(templateUrl, { waitUntil: "domcontentloaded", timeout: EDITOR_TIMEOUT_MS });
  await page.waitForTimeout(3000);

  const openedEditor = await page
    .waitForURL(/\/design\/|\/edit/, { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);

  if (!openedEditor) {
    const clicked =
      (await clickFirstMatchingButton(page, [
        /edit/i,
        /customize/i,
        /use template/i,
        /usar plantilla/i,
        /editar/i,
        /personalizar/i,
      ])) ||
      (await page
        .getByRole("link", { name: /edit|editar|customize|personalizar/i })
        .first()
        .click({ timeout: 5000 })
        .then(() => true)
        .catch(() => false));

    if (clicked) {
      await page.waitForURL(/\/design\/|\/edit/, { timeout: EDITOR_TIMEOUT_MS }).catch(() => undefined);
    }
  }

  await page.waitForTimeout(4000);
}

async function openLayersPanelIfNeeded(page: Page): Promise<void> {
  await clickFirstMatchingButton(page, [/layers|capas|position|posición/i]);
  await page.waitForTimeout(600);
}

async function selectLayerByName(page: Page, layerName: string): Promise<void> {
  await openLayersPanelIfNeeded(page);
  const layer = page.getByText(layerName, { exact: true }).first();
  await layer.waitFor({ state: "visible", timeout: STEP_TIMEOUT_MS });
  await layer.click({ timeout: STEP_TIMEOUT_MS });
  await page.waitForTimeout(800);
}

async function editSelectedTextLayer(page: Page, text: string): Promise<void> {
  await page.keyboard.press("Control+A");
  await page.waitForTimeout(200);
  await page.keyboard.press("Backspace").catch(() => undefined);
  await page.keyboard.type(text.slice(0, 500), { delay: 8 });
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(500);
}

/**
 * Upload via Subidas/Uploads panel using setInputFiles — avoids OS file picker (often crashes Chrome).
 */
async function openUploadsPanel(page: Page): Promise<void> {
  const opened =
    (await clickFirstMatchingButton(page, [/uploads|subidas|cargas/i])) ||
    (await page
      .getByRole("tab", { name: /uploads|subidas|cargas/i })
      .first()
      .click({ timeout: 5000 })
      .then(() => true)
      .catch(() => false));

  if (!opened) {
    await page.getByText(/^Uploads$|^Subidas$|^Cargas$/i).first().click({ timeout: STEP_TIMEOUT_MS });
  }
  await page.waitForTimeout(1200);
}

async function uploadImageToCanvaLibrary(page: Page, localImagePath: string): Promise<void> {
  await openUploadsPanel(page);

  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  if (count === 0) {
    throw new Error("No file input found in Canva Uploads panel");
  }

  let uploaded = false;
  for (let index = 0; index < count; index += 1) {
    try {
      await fileInputs.nth(index).setInputFiles(localImagePath, { timeout: STEP_TIMEOUT_MS });
      uploaded = true;
      break;
    } catch {
      // try next input
    }
  }

  if (!uploaded) {
    throw new Error("Could not upload image via Canva file inputs");
  }

  await page.waitForTimeout(4000);
}

async function applyLatestUploadToPhotoLayer(page: Page): Promise<void> {
  await selectLayerByName(page, "VERAZ_PHOTO");
  await page.waitForTimeout(500);

  await clickFirstMatchingButton(page, [/replace/i, /reemplazar/i, /change/i, /cambiar/i]);
  await page.waitForTimeout(800);

  const recentUpload = page
    .locator(
      [
        '[class*="upload"] img',
        '[data-testid*="upload"] img',
        'section[aria-label*="Upload"] img',
        'section[aria-label*="Subida"] img',
      ].join(", "),
    )
    .first();

  if (await recentUpload.isVisible({ timeout: 8000 }).catch(() => false)) {
    await recentUpload.click({ timeout: STEP_TIMEOUT_MS });
    await page.waitForTimeout(1500);
    return;
  }

  await openUploadsPanel(page);
  const gridImage = page.locator('div[role="list"] img, [class*="folder"] img').first();
  await gridImage.click({ timeout: STEP_TIMEOUT_MS });
  await page.waitForTimeout(1500);
}

async function downloadDesignPng(page: Page, exportPath: string): Promise<void> {
  await mkdir(path.dirname(exportPath), { recursive: true });

  const shareOpened = await clickFirstMatchingButton(page, [
    /^share$/i,
    /compartir/i,
    /share design/i,
  ]);

  if (!shareOpened) {
    throw new Error("Could not open Share menu in Canva");
  }

  await page.waitForTimeout(1500);

  const downloadPromise = page.waitForEvent("download", { timeout: EDITOR_TIMEOUT_MS });

  await clickFirstMatchingButton(page, [/download/i, /descargar/i]);
  await page.waitForTimeout(1500);

  const pngOption = page.getByText(/^PNG$/i).first();
  if (await pngOption.isVisible({ timeout: 5000 }).catch(() => false)) {
    await pngOption.click();
    await page.waitForTimeout(800);
  }

  const finalDownload = await clickFirstMatchingButton(page, [/download/i, /descargar/i]);
  if (!finalDownload) {
    throw new Error("Could not confirm Download in Canva dialog");
  }

  const download = await downloadPromise;
  await download.saveAs(exportPath);
}

export async function exportCanvaDesign(input: CanvaExportInput): Promise<CanvaExportResult> {
  if (!(await pathExists(input.profileDir))) {
    return {
      ok: false,
      error: `Canva profile not found at ${input.profileDir}. Run: npm run social:canva-login`,
    };
  }

  if (!(await pathExists(input.localImagePath))) {
    return { ok: false, error: `Image file not found: ${input.localImagePath}` };
  }

  let context;
  let failed = false;
  let failMessage = "";

  try {
    context = await chromium.launchPersistentContext(path.resolve(input.profileDir), {
      channel: "chrome",
      headless: !input.headed,
      viewport: { width: 1400, height: 900 },
      acceptDownloads: true,
      args: ["--disable-blink-features=AutomationControlled"],
    });

    const page = context.pages()[0] ?? (await context.newPage());

    console.log("[canva] Opening template…");
    await openTemplateInEditor(page, input.templateUrl);

    console.log("[canva] Editing VERAZ_TITLE…");
    await selectLayerByName(page, "VERAZ_TITLE");
    await editSelectedTextLayer(page, input.title);

    console.log("[canva] Editing VERAZ_SOURCE…");
    await selectLayerByName(page, "VERAZ_SOURCE");
    await editSelectedTextLayer(page, input.sourceLabel);

    console.log("[canva] Uploading photo to Subidas (no system file dialog)…");
    await uploadImageToCanvaLibrary(page, input.localImagePath);

    console.log("[canva] Applying upload to VERAZ_PHOTO…");
    await applyLatestUploadToPhotoLayer(page);

    console.log("[canva] Downloading PNG…");
    await downloadDesignPng(page, input.exportPath);

    return { ok: true, exportPath: input.exportPath };
  } catch (error) {
    failed = true;
    failMessage = error instanceof Error ? error.message : "Canva export failed";
    return { ok: false, error: failMessage };
  } finally {
    if (context) {
      const pauseMs = input.pauseOnErrorMs ?? (input.headed ? 45_000 : 0);
      if (failed && pauseMs > 0) {
        console.error(`[canva] Error: ${failMessage}`);
        console.log(`[canva] Keeping browser open ${pauseMs / 1000}s for inspection…`);
        await new Promise((resolve) => setTimeout(resolve, pauseMs));
      }
      await context.close().catch(() => undefined);
    }
  }
}

export function assertCanvaConfig(config: SocialPublishConfig): string | null {
  if (!config.canvaTemplateUrl) {
    return "CANVA_TEMPLATE_URL is required when SOCIAL_CANVA_ENABLED=true";
  }
  return null;
}
