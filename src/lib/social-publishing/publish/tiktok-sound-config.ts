import type { Page } from "playwright";

import { dismissTikTokStudioModals, captureTikTokDebugStep } from "@/lib/social-publishing/publish/tiktok-studio-modals";

const EXPORTS_DIR = process.env.SOCIAL_EXPORTS_DIR?.trim() || ".social/exports";

const USE_SOUND_BUTTON =
  /usar este sonido|use this sound|usar sonido|use sound|usar audio|use audio|listo|done|aceptar|ok|guardar|save/i;

function isEnabled(env: NodeJS.ProcessEnv): boolean {
  const raw = env.SOCIAL_TIKTOK_ADD_SOUND?.trim().toLowerCase();
  return raw !== "false" && raw !== "0";
}

function searchQuery(env: NodeJS.ProcessEnv): string {
  return env.SOCIAL_TIKTOK_SOUND_SEARCH?.trim() || "noticias";
}

async function snap(page: Page, step: string): Promise<void> {
  if (process.env.SOCIAL_TIKTOK_DEBUG?.trim()) {
    await captureTikTokDebugStep(page, step, EXPORTS_DIR);
  }
}

/** Clicks "Sonidos" tab on upload editor (Editar | Sonidos | Texto), not sidebar "Sonidos sin regalías". */
async function openSoundEditorTab(page: Page): Promise<boolean> {
  await dismissTikTokStudioModals(page);

  const exact = page.getByText("Sonidos", { exact: true });
  const count = await exact.count().catch(() => 0);

  for (let i = 0; i < count; i += 1) {
    const el = exact.nth(i);
    const box = await el.boundingBox().catch(() => null);
    if (!box || box.x < 180) continue;
    await el.scrollIntoViewIfNeeded().catch(() => undefined);
    await el.click({ timeout: 12_000, force: true });
    await page.waitForTimeout(1200);
    return true;
  }

  const viaEvaluate = await page
    .evaluate(() => {
      const nodes = Array.from(document.querySelectorAll("button, div, span, a"));
      for (const node of nodes) {
        if ((node.textContent ?? "").trim() !== "Sonidos") continue;
        const el = node as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.x < 180 || r.width < 20) continue;
        const row = el.parentElement?.textContent ?? "";
        if (!/Editar|Texto|Sonido original/i.test(row)) continue;
        el.click();
        return true;
      }
      return false;
    })
    .catch(() => false);

  return viaEvaluate;
}

async function searchSoundLibrary(page: Page, query: string): Promise<boolean> {
  const filled = await page
    .evaluate((q) => {
      const inputs = Array.from(document.querySelectorAll("input"));
      for (const inp of inputs) {
        const r = inp.getBoundingClientRect();
        if (r.x < 200 || r.width < 60 || r.height < 20) continue;
        const ph = (inp.getAttribute("placeholder") ?? "").toLowerCase();
        const aria = (inp.getAttribute("aria-label") ?? "").toLowerCase();
        if (/ubicaci|location|hashtag|descrip|mención|mention|caption/.test(`${ph} ${aria}`)) {
          continue;
        }
        const el = inp as HTMLInputElement;
        el.focus();
        el.value = q;
        el.dispatchEvent(new InputEvent("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      return false;
    }, query)
    .catch(() => false);

  if (filled) {
    await page.keyboard.press("Enter").catch(() => undefined);
    await page.waitForTimeout(3200);
    return true;
  }

  return false;
}

/** Clicks first track row in the Sonidos panel (e.g. "01:00 · Artist"). */
async function selectFirstSoundResult(page: Page): Promise<boolean> {
  const picked = await page
    .evaluate(() => {
      const candidates = Array.from(document.querySelectorAll("div, li, button, span"));
      for (const node of candidates) {
        const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
        if (!/\d{1,2}:\d{2}\s·/.test(text)) continue;
        if (text.length < 8 || text.length > 140) continue;
        if (/para ti|favoritos|reciente|sin límites|plantillas|cancelar|guardar/i.test(text)) {
          continue;
        }
        const el = node as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.width < 80 || r.height < 24 || r.x < 200) continue;
        el.click();
        return true;
      }
      return false;
    })
    .catch(() => false);

  if (picked) return true;

  const firstTitle = page.getByText(/\d{1,2}:\d{2}\s·/).first();
  if (await firstTitle.isVisible({ timeout: 4000 }).catch(() => false)) {
    await firstTitle.click({ timeout: 10_000, force: true });
    return true;
  }

  return false;
}

async function saveSoundEditor(page: Page): Promise<boolean> {
  const save = page.getByRole("button", { name: /^Guardar$|^Save$/i }).last();
  if (await save.isVisible({ timeout: 8000 }).catch(() => false)) {
    await save.click({ timeout: 12_000, force: true });
    await page.waitForTimeout(2000);
    return true;
  }
  return false;
}

async function confirmSoundSelection(page: Page): Promise<void> {
  const confirm = page.getByRole("button", { name: USE_SOUND_BUTTON }).first();
  if (await confirm.isVisible({ timeout: 5000 }).catch(() => false)) {
    await confirm.click({ timeout: 12_000, force: true });
    await page.waitForTimeout(800);
  }
}

export type TikTokSoundConfigResult = { applied: boolean; query: string };

/**
 * TikTok Studio upload: tab Sonidos → search keyword → first library track.
 */
export async function configureTikTokUploadSound(
  page: Page,
  env: NodeJS.ProcessEnv = process.env,
  searchOverride?: string,
): Promise<TikTokSoundConfigResult> {
  const query = searchOverride?.trim() || searchQuery(env);
  if (!isEnabled(env)) {
    return { applied: false, query };
  }

  try {
    await dismissTikTokStudioModals(page);
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
    await page.waitForTimeout(600);

    const opened = await openSoundEditorTab(page);
    await snap(page, "sound-tab");
    if (!opened) {
      return { applied: false, query };
    }

    const searched = await searchSoundLibrary(page, query);
    await snap(page, "sound-search");

    const selected = await selectFirstSoundResult(page);
    await snap(page, "sound-pick");
    if (!selected) {
      return { applied: false, query };
    }

    await page.waitForTimeout(800);
    await confirmSoundSelection(page);
    const saved = await saveSoundEditor(page);
    await snap(page, "sound-confirm");
    if (!saved) {
      return { applied: false, query };
    }

    return { applied: true, query };
  } catch {
    await page.keyboard.press("Escape").catch(() => undefined);
    await snap(page, "sound-error");
    return { applied: false, query };
  }
}

export function isTikTokSoundRequired(env: NodeJS.ProcessEnv = process.env): boolean {
  return isEnabled(env);
}
