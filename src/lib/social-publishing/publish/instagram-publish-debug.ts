import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Page } from "playwright";

function isInstagramDebugEnabled(): boolean {
  const raw = process.env.SOCIAL_INSTAGRAM_DEBUG?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export async function captureInstagramDebugStep(
  page: Page,
  step: string,
  exportsDir: string,
): Promise<void> {
  if (!isInstagramDebugEnabled()) return;

  const dir = path.resolve(exportsDir);
  await mkdir(dir, { recursive: true });

  const safeStep = step.replace(/[^\w-]+/g, "_").slice(0, 48);
  const pngPath = path.join(dir, `instagram-debug-${safeStep}.png`);
  const txtPath = path.join(dir, `instagram-debug-${safeStep}.txt`);

  await page.screenshot({ path: pngPath, fullPage: true }).catch(() => undefined);

  const probe = await page
    .evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"))
        .map((b) => b.textContent?.trim() ?? "")
        .filter(Boolean)
        .slice(0, 20);
      return {
        url: window.location.href,
        bodyText: (document.body?.innerText ?? "").slice(0, 2000),
        buttons,
      };
    })
    .catch(() => ({ url: page.url(), bodyText: "", buttons: [] as string[] }));

  const lines = [
    `step=${step}`,
    `url=${probe.url}`,
    "",
    "--- body (trim) ---",
    probe.bodyText,
    "",
    "--- buttons ---",
    probe.buttons.join(" | "),
  ];

  await writeFile(txtPath, lines.join("\n"), "utf8").catch(() => undefined);
}

export type InstagramVerifyResult = { ok: true } | { ok: false; hint: string };

export async function verifyInstagramFeedOrReelShared(page: Page): Promise<InstagramVerifyResult> {
  const ok = await page
    .waitForFunction(
      () => {
        const url = window.location.href;
        const text = document.body?.innerText ?? "";
        if (/instagram\.com\/(?!create\/select|accounts\/)/i.test(url) && !/\/create\/style/i.test(url)) {
          if (!/create\/details|create\/style|create\/edit/i.test(url)) return true;
        }
        if (/tu publicación se ha compartido|post shared|reel shared|publicación compartida|shared/i.test(text)) {
          return true;
        }
        if (/create\/confirmation|share_success/i.test(url)) return true;
        const shareVisible = Array.from(document.querySelectorAll("button")).some((b) =>
          /^(compartir|share)$/i.test(b.textContent?.trim() ?? ""),
        );
        return !shareVisible && !/\/create\/(style|details|edit)/i.test(url);
      },
      { timeout: 45_000 },
    )
    .catch(() => null);

  if (ok) return { ok: true };

  if (/instagram\.com\/create\/?$/i.test(page.url())) {
    return { ok: false, hint: "Perfil @create (URL /create/) — sesión o navegación incorrecta." };
  }

  return { ok: false, hint: `URL actual: ${page.url()}` };
}
