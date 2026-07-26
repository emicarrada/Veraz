import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Page } from "playwright";

const DISMISS_BUTTON =
  /^(entendido|got it|ok|aceptar|continuar|not now|ahora no|skip|omitir|saltar|allow|permitir|cerrar|close|siguiente|next|confirm|confirmar)$/i;

const DISMISS_BUTTON_PARTIAL =
  /entendido|got it|not now|ahora no|skip|omitir|allow|permitir|continuar|aceptar/i;

type DialogProbe = {
  tag: string;
  className: string;
  role: string | null;
  ariaModal: string | null;
  textPreview: string;
  buttonLabels: string[];
  zIndex: number;
};

export type TopmostDialogInfo = {
  found: boolean;
  textPreview: string;
  buttonLabels: string[];
  outerHtml: string;
};

function isTikTokDebugEnabled(): boolean {
  const raw = process.env.SOCIAL_TIKTOK_DEBUG?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export async function captureTikTokDebugStep(page: Page, step: string, exportsDir: string): Promise<void> {
  if (!isTikTokDebugEnabled()) return;

  const dir = path.resolve(exportsDir);
  await mkdir(dir, { recursive: true });

  const safeStep = step.replace(/[^\w-]+/g, "_").slice(0, 48);
  const pngPath = path.join(dir, `tiktok-debug-${safeStep}.png`);
  const txtPath = path.join(dir, `tiktok-debug-${safeStep}.txt`);

  await page.screenshot({ path: pngPath, fullPage: true }).catch(() => undefined);

  const probe = await page
    .evaluate(() => {
      const selectors = [
        '[role="dialog"]',
        '[aria-modal="true"]',
        '[class*="TUXModal"]',
        '[class*="modal-desc"]',
        '[class*="Modal"]',
        '[class*="Popover"]',
        "#react-joyride-portal",
        ".react-joyride__overlay",
      ];

      const seen = new Set<Element>();
      const dialogs: DialogProbe[] = [];

      for (const sel of selectors) {
        for (const el of Array.from(document.querySelectorAll(sel))) {
          if (seen.has(el)) continue;
          seen.add(el);
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < 8 || rect.height < 8) continue;

          const buttons = Array.from(el.querySelectorAll("button"))
            .map((b) => b.textContent?.trim() ?? "")
            .filter(Boolean)
            .slice(0, 8);

          dialogs.push({
            tag: el.tagName.toLowerCase(),
            className: (el.className?.toString() ?? "").slice(0, 120),
            role: el.getAttribute("role"),
            ariaModal: el.getAttribute("aria-modal"),
            textPreview: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 280),
            buttonLabels: buttons,
            zIndex: Number.parseInt(style.zIndex, 10) || 0,
          });
        }
      }

      dialogs.sort((a, b) => b.zIndex - a.zIndex);

      return {
        url: window.location.href,
        bodyText: (document.body?.innerText ?? "").slice(0, 2000),
        dialogs,
      };
    })
    .catch(() => ({ url: page.url(), bodyText: "", dialogs: [] as DialogProbe[] }));

  const lines = [
    `step=${step}`,
    `url=${probe.url}`,
    "",
    "--- body (trim) ---",
    probe.bodyText,
    "",
    "--- dialogs ---",
    ...probe.dialogs.map(
      (d, i) =>
        `[${i}] <${d.tag}> role=${d.role} aria-modal=${d.ariaModal} z=${d.zIndex}\n  class=${d.className}\n  text=${d.textPreview}\n  buttons=${d.buttonLabels.join(" | ")}`,
    ),
  ];

  await writeFile(txtPath, lines.join("\n"), "utf8").catch(() => undefined);
}

export async function saveTopmostDialogArtifacts(
  page: Page,
  exportsDir: string,
  suffix: string,
): Promise<TopmostDialogInfo> {
  const dir = path.resolve(exportsDir);
  await mkdir(dir, { recursive: true });

  const info = await readTopmostDialog(page);
  if (info.found && info.outerHtml) {
    const htmlPath = path.join(dir, `tiktok-dialog-${suffix}.html`);
    await writeFile(htmlPath, info.outerHtml, "utf8").catch(() => undefined);
  }
  return info;
}

async function readTopmostDialog(page: Page): Promise<TopmostDialogInfo> {
  return page
    .evaluate(() => {
      const candidates = Array.from(
        document.querySelectorAll(
          '[role="dialog"], [aria-modal="true"], [class*="TUXModal"], [class*="modal-desc"], .react-joyride__overlay, #react-joyride-portal',
        ),
      );

      let best: Element | null = null;
      let bestZ = -1;

      for (const el of candidates) {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) continue;
        const z = Number.parseInt(style.zIndex, 10) || 0;
        if (z >= bestZ) {
          bestZ = z;
          best = el;
        }
      }

      if (!best) {
        return { found: false, textPreview: "", buttonLabels: [], outerHtml: "" };
      }

      const buttons = Array.from(best.querySelectorAll("button"))
        .map((b) => b.textContent?.trim() ?? "")
        .filter(Boolean);

      return {
        found: true,
        textPreview: (best.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 400),
        buttonLabels: buttons.slice(0, 12),
        outerHtml: best.outerHTML.slice(0, 50_000),
      };
    })
    .catch(() => ({ found: false, textPreview: "", buttonLabels: [], outerHtml: "" }));
}

async function hasBlockingOverlay(page: Page): Promise<boolean> {
  return page
    .evaluate(() => {
      const blockers = document.querySelectorAll(
        '[role="dialog"], [aria-modal="true"], [class*="TUXModal-overlay"], [class*="TUXModal"], .react-joyride__overlay, #react-joyride-portal',
      );
      for (const el of Array.from(blockers)) {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 50) return true;
      }
      return false;
    })
    .catch(() => false);
}

async function tryCheckVisibleCheckboxes(page: Page): Promise<boolean> {
  const checkboxes = page.locator(
    '[role="dialog"] input[type="checkbox"], [aria-modal="true"] input[type="checkbox"], [class*="TUXModal"] input[type="checkbox"], [class*="modal"] input[type="checkbox"]',
  );
  const count = await checkboxes.count().catch(() => 0);
  let checkedAny = false;
  for (let i = 0; i < Math.min(count, 6); i += 1) {
    const box = checkboxes.nth(i);
    if (!(await box.isVisible({ timeout: 400 }).catch(() => false))) continue;
    if (await box.isChecked().catch(() => true)) continue;
    await box.check({ force: true, timeout: 3000 }).catch(() => undefined);
    checkedAny = true;
  }
  return checkedAny;
}

async function clickDismissInTopmostDialog(page: Page): Promise<boolean> {
  return page
    .evaluate(({ exactPattern, partialPattern }) => {
      const exact = new RegExp(exactPattern, "i");
      const partial = new RegExp(partialPattern, "i");

      const containers = Array.from(
        document.querySelectorAll(
          '[role="dialog"], [aria-modal="true"], [class*="TUXModal"], [class*="modal-desc"], #react-joyride-portal, .react-joyride__overlay',
        ),
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 40 && rect.height > 40;
      });

      containers.sort((a, b) => {
        const za = Number.parseInt(window.getComputedStyle(a).zIndex, 10) || 0;
        const zb = Number.parseInt(window.getComputedStyle(b).zIndex, 10) || 0;
        return zb - za;
      });

      const root = containers[0] ?? document.body;
      const buttons = Array.from(root.querySelectorAll("button, [role='button']")) as HTMLElement[];

      for (const btn of buttons) {
        const label = (btn.textContent ?? btn.getAttribute("aria-label") ?? "").trim();
        if (!label) continue;
        if (exact.test(label) || partial.test(label)) {
          btn.click();
          return true;
        }
      }
      return false;
    }, { exactPattern: DISMISS_BUTTON.source, partialPattern: DISMISS_BUTTON_PARTIAL.source })
    .catch(() => false);
}

async function forceRemoveStaleOverlays(page: Page): Promise<void> {
  await page
    .evaluate(() => {
      document.querySelectorAll("#react-joyride-portal, .react-joyride__overlay").forEach((el) => el.remove());
      document.querySelectorAll('[class*="TUXModal-overlay"]').forEach((el) => el.remove());
    })
    .catch(() => undefined);
}

/**
 * Click-first modal dismissal for TikTok Studio (Joyride, TUXModal, generic dialogs).
 */
export async function dismissTikTokStudioModals(page: Page): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await tryCheckVisibleCheckboxes(page);

    const clicked = await clickDismissInTopmostDialog(page);
    if (clicked) {
      await page.waitForTimeout(400);
      continue;
    }

    const skipTour = page.getByRole("button", {
      name: /skip|omitir|saltar|close|cerrar|got it|entendido/i,
    });
    if (await skipTour.first().isVisible({ timeout: 600 }).catch(() => false)) {
      await skipTour.first().click({ force: true, timeout: 4000 }).catch(() => undefined);
      await page.waitForTimeout(400);
      continue;
    }

    const blocking = await hasBlockingOverlay(page);
    if (!blocking) break;

    await page.keyboard.press("Escape").catch(() => undefined);
    await page.waitForTimeout(300);

    if (await hasBlockingOverlay(page)) {
      await forceRemoveStaleOverlays(page);
    }

    await page.waitForTimeout(500);
  }
}

export async function acceptTikTokPublishTerms(page: Page): Promise<void> {
  await dismissTikTokStudioModals(page);
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count().catch(() => 0);
  for (let i = 0; i < Math.min(count, 8); i += 1) {
    const box = checkboxes.nth(i);
    if (!(await box.isVisible({ timeout: 500 }).catch(() => false))) continue;
    if (await box.isChecked().catch(() => true)) continue;
    await box.check({ force: true, timeout: 3000 }).catch(() => undefined);
  }
}

export async function describeBlockingUi(page: Page): Promise<string | null> {
  const dialog = await readTopmostDialog(page);
  if (dialog.found && dialog.textPreview) {
    return dialog.textPreview.slice(0, 200);
  }
  const onUpload = /\/upload/i.test(page.url());
  if (onUpload) {
    const publishVisible = await page
      .getByRole("button", { name: /^Publicar$|^Post$/i })
      .last()
      .isVisible({ timeout: 800 })
      .catch(() => false);
    if (publishVisible) return "Sigue en pantalla de subida con botón Publicar visible.";
  }
  return null;
}
