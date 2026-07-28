import type { Page } from "playwright";

/** TikTok Studio sidebar / editor — pick a track from TikTok's library (not file audio). */
const ADD_SOUND_LABEL =
  /añadir sonido|agregar sonido|add sound|add music|agregar música|añadir música|biblioteca de sonidos|sound library|sonidos|sounds/i;

const USE_SOUND_BUTTON =
  /usar este sonido|use this sound|usar sonido|use sound|usar audio|use audio|listo|done|aceptar|ok|guardar|save/i;

function isEnabled(env: NodeJS.ProcessEnv): boolean {
  const raw = env.SOCIAL_TIKTOK_ADD_SOUND?.trim().toLowerCase();
  return raw !== "false" && raw !== "0";
}

function searchQuery(env: NodeJS.ProcessEnv): string {
  return env.SOCIAL_TIKTOK_SOUND_SEARCH?.trim() || "noticias";
}

async function openSoundLibrary(page: Page): Promise<boolean> {
  const viaEvaluate = await page
    .evaluate(() => {
      const re =
        /añadir sonido|agregar sonido|add sound|add music|biblioteca|sound library|music library|sonidos/i;
      const nodes = Array.from(
        document.querySelectorAll("button, a, div[role='button'], span[role='button']"),
      );
      for (const node of nodes) {
        const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
        if (!text || !re.test(text)) continue;
        const el = node as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) continue;
        el.click();
        return true;
      }
      return false;
    })
    .catch(() => false);

  if (viaEvaluate) return true;

  return page
    .getByRole("button", { name: ADD_SOUND_LABEL })
    .first()
    .click({ timeout: 10_000, force: true })
    .then(() => true)
    .catch(() => false);
}

async function searchSoundLibrary(page: Page, query: string): Promise<void> {
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(400);

  const filled = await page
    .evaluate((q) => {
      const inputs = Array.from(document.querySelectorAll('input[type="search"], input[type="text"], input[role="input"]'));
      const soundInput = inputs.find((inp) => {
        const ph = (inp.getAttribute("placeholder") ?? "").toLowerCase();
        const aria = (inp.getAttribute("aria-label") ?? "").toLowerCase();
        const combined = `${ph} ${aria}`;
        if (/ubicaci|location|hashtag|tag|lugar|place/i.test(combined)) return false;
        return /sonido|sound|música|music|audio|canción|song/i.test(combined);
      }) as HTMLInputElement | undefined;

      if (!soundInput) return false;
      soundInput.focus();
      soundInput.value = q;
      soundInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
      soundInput.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }, query)
    .catch(() => false);

  if (filled) {
    await page.keyboard.press("Enter").catch(() => undefined);
    await page.waitForTimeout(2800);
    return;
  }

  const search = page
    .locator(
      'input[placeholder*="sonido" i], input[placeholder*="sound" i], input[placeholder*="música" i], input[placeholder*="music" i]',
    )
    .first();

  if (await search.isVisible({ timeout: 5000 }).catch(() => false)) {
    await search.click({ force: true });
    await search.fill(query);
    await page.keyboard.press("Enter").catch(() => undefined);
    await page.waitForTimeout(2800);
  }
}

async function selectFirstSoundResult(page: Page): Promise<boolean> {
  const useOnRow = page
    .locator("button, [role='button']")
    .filter({ hasText: /^Usar$|^Use$|^Usar sonido$|^Use sound$/i })
    .first();

  if (await useOnRow.isVisible({ timeout: 4000 }).catch(() => false)) {
    await useOnRow.click({ timeout: 10_000, force: true });
    return true;
  }

  const picked = await page
    .evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll(
          '[class*="SoundItem"], [class*="sound-item"], [class*="music-item"], [data-e2e*="sound"], div[role="listitem"]',
        ),
      );
      for (const row of rows) {
        const rect = (row as HTMLElement).getBoundingClientRect();
        if (rect.width < 60 || rect.height < 30) continue;
        const btn = row.querySelector("button, [role='button']") as HTMLElement | null;
        const target = btn ?? (row as HTMLElement);
        const label = (target.textContent ?? "").trim();
        if (label.length < 2) continue;
        if (/buscar|search|cancel|cerrar|close|ver todo/i.test(label)) continue;
        target.click();
        return true;
      }
      return false;
    })
    .catch(() => false);

  return picked;
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
 * Before "Publicar": open TikTok Studio sound picker, search, and apply a library track.
 * Does not use audio from the uploaded MP4 (video file stays muted).
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
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
    await page.waitForTimeout(600);

    const opened = await openSoundLibrary(page);
    if (!opened) {
      return { applied: false, query };
    }

    await page.waitForTimeout(1200);
    await searchSoundLibrary(page, query);

    const selected = await selectFirstSoundResult(page);
    if (!selected) {
      return { applied: false, query };
    }

    await page.waitForTimeout(1000);
    await confirmSoundSelection(page);

    return { applied: true, query };
  } catch {
    await page.keyboard.press("Escape").catch(() => undefined);
    return { applied: false, query };
  }
}
