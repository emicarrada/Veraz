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
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(300);

  const filled = await page
    .evaluate((q) => {
      const inputs = Array.from(
        document.querySelectorAll('input[type="search"], input[type="text"], input[role="input"]'),
      );
      for (const inp of inputs) {
        const ph = (inp.getAttribute("placeholder") ?? "").toLowerCase();
        const aria = (inp.getAttribute("aria-label") ?? "").toLowerCase();
        const combined = `${ph} ${aria}`;
        if (/ubicaci|location|hashtag|tag|lugar|place|descrip|caption|mención|mention/i.test(combined)) {
          continue;
        }
        if (!/sonido|sound|música|music|audio|buscar/i.test(combined) && !ph.includes("buscar")) {
          continue;
        }
        const el = inp as HTMLInputElement;
        const r = el.getBoundingClientRect();
        if (r.width < 80) continue;
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

  const search = page
    .locator(
      'input[placeholder*="sonido" i], input[placeholder*="sound" i], input[placeholder*="música" i], input[placeholder*="music" i], input[placeholder*="Buscar" i]',
    )
    .first();

  if (await search.isVisible({ timeout: 6000 }).catch(() => false)) {
    const ph = (await search.getAttribute("placeholder")) ?? "";
    if (/ubicaci|location|hashtag/i.test(ph)) return false;
    await search.click({ force: true });
    await search.fill(query);
    await page.keyboard.press("Enter").catch(() => undefined);
    await page.waitForTimeout(3200);
    return true;
  }

  return false;
}

async function selectFirstSoundResult(page: Page): Promise<boolean> {
  const useBtn = page
    .locator("button, [role='button']")
    .filter({ hasText: /^Usar$|^Use$|^Usar sonido$|^Use sound$|^Añadir$|^Add$/i })
    .first();

  if (await useBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await useBtn.click({ timeout: 12_000, force: true });
    return true;
  }

  return page
    .evaluate(() => {
      const items = Array.from(
        document.querySelectorAll(
          '[class*="SoundItem"], [class*="sound-item"], [class*="music-item"], [data-e2e*="sound"], li, div[role="listitem"]',
        ),
      );
      for (const item of items) {
        const rect = (item as HTMLElement).getBoundingClientRect();
        if (rect.width < 100 || rect.height < 36 || rect.x < 100) continue;
        const text = (item.textContent ?? "").replace(/\s+/g, " ").trim();
        if (text.length < 4 || text.length > 200) continue;
        if (/buscar|search|cancel|cerrar|sin regalías|royalty|tendencias/i.test(text)) continue;
        const clickTarget =
          (item.querySelector("button, [role='button']") as HTMLElement | null) ?? (item as HTMLElement);
        clickTarget.click();
        return true;
      }
      return false;
    })
    .catch(() => false);
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
      return { applied: false, query: searched ? query : `${query} (sin búsqueda)` };
    }

    await page.waitForTimeout(1000);
    await confirmSoundSelection(page);
    await snap(page, "sound-confirm");

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
