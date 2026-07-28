import type { Page } from "playwright";

import { dismissTikTokStudioModals, captureTikTokDebugStep } from "@/lib/social-publishing/publish/tiktok-studio-modals";

const EXPORTS_DIR = process.env.SOCIAL_EXPORTS_DIR?.trim() || ".social/exports";

const USE_SOUND_BUTTON =
  /usar este sonido|use this sound|usar sonido|use sound|usar audio|use audio|añadir sonido|add sound|listo|done|aceptar|ok/i;

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

async function clickSonidosTab(page: Page, minY = 280): Promise<boolean> {
  const sonidos = page.getByText("Sonidos", { exact: true });
  const count = await sonidos.count().catch(() => 0);
  for (let i = 0; i < count; i += 1) {
    const el = sonidos.nth(i);
    const box = await el.boundingBox().catch(() => null);
    if (!box || box.x < 200 || box.y < minY) continue;
    await el.scrollIntoViewIfNeeded().catch(() => undefined);
    await el.click({ timeout: 12_000, force: true });
    await page.waitForTimeout(1200);
    return true;
  }
  return false;
}

/** Opens Sonidos on the upload editor (toolbar tab, or Editar → Sonidos). */
async function openSoundEditorTab(page: Page): Promise<boolean> {
  await dismissTikTokStudioModals(page);

  if (await clickSonidosTab(page, 320)) {
    return true;
  }

  const editButtons = page.getByText("Editar", { exact: true });
  const editCount = await editButtons.count().catch(() => 0);
  for (let i = 0; i < editCount; i += 1) {
    const el = editButtons.nth(i);
    const box = await el.boundingBox().catch(() => null);
    if (!box || box.y < 280 || box.x < 350) continue;
    await el.click({ timeout: 10_000, force: true });
    await page.waitForTimeout(1500);
    break;
  }

  return clickSonidosTab(page, 200);
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

async function firstTrackTitleFromPage(page: Page): Promise<string | null> {
  return page
    .evaluate(() => {
      const lines = (document.body?.innerText ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      for (let i = 1; i < lines.length; i += 1) {
        if (!/^\d{1,2}:\d{2}\s·/.test(lines[i]!)) continue;
        const candidate = lines[i - 1]!;
        if (candidate.length < 3 || candidate.length > 70) continue;
        if (/para ti|favoritos|reciente|sin límites|sonidos|plantillas|cancelar|guardar|editar|texto/i.test(candidate)) {
          continue;
        }
        return candidate;
      }
      return null;
    })
    .catch(() => null);
}

/** Clicks first track in Sonidos list (title line before "MM:SS · artist"). */
async function selectFirstSoundResult(page: Page): Promise<{ ok: boolean; trackTitle: string | null }> {
  const title = await firstTrackTitleFromPage(page);

  if (title) {
    const durationLine = await page
      .evaluate((trackTitle) => {
        const lines = (document.body?.innerText ?? "").split("\n").map((l) => l.trim());
        for (const line of lines) {
          if (line.startsWith(trackTitle) && /\d{1,2}:\d{2}\s·/.test(line)) return line;
          if (/\d{1,2}:\d{2}\s·/.test(line) && lines[lines.indexOf(line) - 1] === trackTitle) {
            return line;
          }
        }
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] === trackTitle && lines[i + 1] && /\d{1,2}:\d{2}\s·/.test(lines[i + 1]!)) {
            return lines[i + 1]!;
          }
        }
        return null;
      }, title)
      .catch(() => null);

    const clickText = durationLine ?? title;
    const clicked = await page
      .getByText(clickText, { exact: true })
      .first()
      .dblclick({ timeout: 12_000, force: true })
      .then(() => true)
      .catch(async () =>
        page
          .getByText(title, { exact: true })
          .first()
          .dblclick({ timeout: 12_000, force: true })
          .then(() => true)
          .catch(() => false),
      );
    if (clicked) {
      await page.waitForTimeout(1200);
      await clickTrackRowAction(page, title);
      return { ok: true, trackTitle: title };
    }
  }

  const domClick = await page
    .evaluate(() => {
      const candidates = Array.from(document.querySelectorAll("div, li, button"));
      for (const node of candidates) {
        const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
        if (!/\d{1,2}:\d{2}\s·/.test(text)) continue;
        if (text.length < 8 || text.length > 140) continue;
        const el = node as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.width < 100 || r.height < 28 || r.x < 200) continue;
        el.click();
        return true;
      }
      return false;
    })
    .catch(() => false);

  const fallbackTitle = domClick ? await firstTrackTitleFromPage(page) : null;
  return { ok: domClick, trackTitle: fallbackTitle };
}

/** Plus / check on the track row after selection. */
async function clickTrackRowAction(page: Page, trackTitle: string): Promise<void> {
  await page
    .evaluate((name) => {
      const rows = Array.from(document.querySelectorAll("div, li"));
      for (const row of rows) {
        const text = (row.textContent ?? "").replace(/\s+/g, " ").trim();
        if (!text.includes(name) || !/\d{1,2}:\d{2}\s·/.test(text)) continue;
        const r = row.getBoundingClientRect();
        if (r.x < 200 || r.width < 80) continue;
        const buttons = Array.from(row.querySelectorAll("button, [role='button']"));
        for (const btn of buttons) {
          const label = (btn.textContent ?? "").trim();
          const aria = btn.getAttribute("aria-label") ?? "";
          if (/usar|use|añadir|add|\+/i.test(`${label} ${aria}`) || label.length <= 2) {
            (btn as HTMLElement).click();
            return;
          }
        }
        if (buttons.length > 0) {
          (buttons[buttons.length - 1] as HTMLElement).click();
        }
        return;
      }
    }, trackTitle)
    .catch(() => undefined);
}

async function boostAddedSoundVolume(page: Page): Promise<void> {
  await page
    .evaluate(() => {
      const setRange = (input: HTMLInputElement, value: number) => {
        input.value = String(value);
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const ranges = Array.from(document.querySelectorAll("input[type='range']")) as HTMLInputElement[];
      if (ranges.length === 0) return;

      const labeled: { input: HTMLInputElement; added: boolean }[] = [];
      for (const input of ranges) {
        let added = false;
        let node: HTMLElement | null = input;
        for (let depth = 0; depth < 6 && node; depth += 1) {
          const t = (node.textContent ?? "").toLowerCase();
          if (/añadido|agregado|added sound|added music/.test(t)) added = true;
          if (/original/.test(t) && !added) added = false;
          node = node.parentElement;
        }
        labeled.push({ input, added });
      }

      for (const { input, added } of labeled) {
        setRange(input, added ? 100 : 0);
      }

      if (labeled.length === 1) {
        setRange(labeled[0]!.input, 100);
      } else if (labeled.length >= 2 && labeled.every((l) => !l.added)) {
        setRange(labeled[0]!.input, 0);
        setRange(labeled[1]!.input, 100);
      }
    })
    .catch(() => undefined);
}

/** True when the open editor shows a library track on the timeline (before Guardar). */
async function soundEditorTrackReady(page: Page, trackTitle: string | null): Promise<boolean> {
  return page
    .evaluate((title) => {
      const body = document.body?.innerText ?? "";
      const ranges = document.querySelectorAll("input[type='range']").length;
      const editorOpen = body.includes("Guardar") && body.includes("Cancelar");

      if (!editorOpen) {
        return false;
      }

      if (/volumen del sonido añadido|added sound volume|sonido añadido/i.test(body)) {
        return true;
      }

      if (title && body.includes(title) && ranges >= 1) {
        return true;
      }

      if (ranges >= 2 && /sonido original/i.test(body)) {
        return true;
      }

      return false;
    }, trackTitle)
    .catch(() => false);
}

async function dismissFloatingMenus(page: Page): Promise<void> {
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(350);
  await dismissTikTokStudioModals(page);
}

async function saveSoundEditor(page: Page): Promise<boolean> {
  const save = page.getByRole("button", { name: /^Guardar$|^Save$/i }).last();
  if (await save.isVisible({ timeout: 8000 }).catch(() => false)) {
    await save.click({ timeout: 12_000, force: true });
    await page.waitForTimeout(2500);
    return true;
  }
  return !(await page
    .getByRole("button", { name: /^Guardar$|^Save$/i })
    .first()
    .isVisible()
    .catch(() => false));
}

async function confirmSoundSelection(page: Page): Promise<void> {
  const confirm = page.getByRole("button", { name: USE_SOUND_BUTTON }).first();
  if (await confirm.isVisible({ timeout: 5000 }).catch(() => false)) {
    await confirm.click({ timeout: 12_000, force: true });
    await page.waitForTimeout(800);
    return;
  }

  const textBtn = page.getByText(/usar este sonido|use this sound|añadir sonido|add sound/i).first();
  if (await textBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    await textBtn.click({ timeout: 12_000, force: true });
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

    await page.waitForTimeout(800);
    await searchSoundLibrary(page, query);
    await snap(page, "sound-search");

    await page.keyboard.press("Tab").catch(() => undefined);
    await page.keyboard.press("ArrowDown").catch(() => undefined);
    await page.waitForTimeout(400);
    await page.keyboard.press("Enter").catch(() => undefined);
    await page.waitForTimeout(1200);

    await dismissFloatingMenus(page);

    const picked = await selectFirstSoundResult(page);
    await snap(page, "sound-pick");
    if (!picked.ok) {
      return { applied: false, query };
    }

    await page.waitForTimeout(800);
    await dismissFloatingMenus(page);
    await confirmSoundSelection(page);
    await boostAddedSoundVolume(page);

    let editorReady = await soundEditorTrackReady(page, picked.trackTitle);
    if (!editorReady) {
      await page.keyboard.press("Enter").catch(() => undefined);
      await page.waitForTimeout(600);
      await confirmSoundSelection(page);
      await boostAddedSoundVolume(page);
      editorReady = await soundEditorTrackReady(page, picked.trackTitle);
    }

    if (!editorReady) {
      await snap(page, "sound-not-applied");
      return { applied: false, query };
    }

    const saved = await saveSoundEditor(page);
    await snap(page, "sound-confirm");
    if (!saved) {
      return { applied: false, query };
    }

    await dismissTikTokStudioModals(page);
    await page.waitForTimeout(1200);

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
