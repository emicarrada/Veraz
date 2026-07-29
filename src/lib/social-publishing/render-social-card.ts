import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp, { type OverlayOptions } from "sharp";

import {
  DEFAULT_SOCIAL_CARD_VARIANT,
  SOCIAL_CARD_VARIANTS,
  isHeroGradientVariant,
  type SocialCardVariant,
} from "@/features/social-publishing/templates/card-variants";
import {
  buildHeroGradientOverlay,
  getHeroLogoPlacement,
} from "@/lib/social-publishing/hero-gradient-overlay";
import { wrapTitleLines } from "@/lib/social-publishing/wrap-title-lines";

export type RenderSocialCardInput = {
  title: string;
  sourceLabel: string;
  photoPath: string;
  outputPath: string;
  variant?: SocialCardVariant;
  /** Absolute path to repo root for fonts/logo */
  projectRoot?: string;
};

const COLORS = {
  bg: "#0a0a0a",
  surface: "#111111",
  ink: "#f5f5f5",
  inkSecondary: "#c4c4c4",
  inkMuted: "#8a8a8a",
  border: "#2a2a2a",
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title: string, maxCharsPerLine: number): string[] {
  return wrapTitleLines(title, maxCharsPerLine);
}

function buildStandardOverlaySvg(
  variant: Exclude<SocialCardVariant, "hero-gradient" | "hero-gradient-vertical">,
  title: string,
  sourceLabel: string,
  layout: (typeof SOCIAL_CARD_VARIANTS)[SocialCardVariant],
  fontFilePath: string,
): Buffer {
  const { width, height } = layout;
  const titleLines = wrapTitle(title, 32);
  const titleFontSize = 46;
  const titleLineHeight = titleFontSize * 1.15;
  const titleStartY =
    variant === "light-frame" ? layout.photo.y + layout.photo.height + 72 : 640;

  const titleTspans = titleLines
    .map(
      (line, index) =>
        `<tspan x="72" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const sourceY = 920;
  const sourceFill = variant === "light-frame" ? "#525252" : COLORS.inkMuted;

  let backdrop = "";
  if (variant === "editorial") {
    backdrop = `
      <rect x="0" y="${layout.photo.height - 1}" width="${width}" height="${height - layout.photo.height + 1}" fill="${COLORS.surface}"/>
      <rect x="0" y="${layout.photo.height - 120}" width="${width}" height="120" fill="url(#photoFade)"/>
    `;
  } else {
    const footerY = layout.photo.y + layout.photo.height + 24;
    backdrop = `
      <rect x="32" y="32" width="${width - 64}" height="${height - 64}" rx="24" fill="none" stroke="${COLORS.border}" stroke-width="3"/>
      <rect x="32" y="${footerY}" width="${width - 64}" height="${height - footerY - 32}" rx="0" fill="${COLORS.bg}"/>
    `;
  }

  const sourcePill =
    variant === "light-frame"
      ? `<text x="72" y="${sourceY}" font-family="VerazSocial, Helvetica, Arial, sans-serif" font-size="28" font-weight="600" fill="${sourceFill}">${escapeXml(sourceLabel.toUpperCase())}</text>`
      : `<rect x="72" y="${sourceY - 36}" rx="8" ry="8" width="${Math.min(420, sourceLabel.length * 18 + 48)}" height="44" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="2"/>
         <text x="92" y="${sourceY - 6}" font-family="VerazSocial, Helvetica, Arial, sans-serif" font-size="26" font-weight="600" fill="${COLORS.inkSecondary}">${escapeXml(sourceLabel)}</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="photoFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.surface}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${COLORS.surface}" stop-opacity="1"/>
    </linearGradient>
    <style>
      @font-face {
        font-family: 'VerazSocial';
        src: url('file://${fontFilePath.replace(/\\/g, "/")}') format('woff2');
        font-weight: 700;
      }
    </style>
  </defs>
  ${backdrop}
  <text x="72" y="${titleStartY}" font-family="VerazSocial, Helvetica, Arial, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.ink}">${titleTspans}</text>
  ${sourcePill}
  <text x="${width - 72}" y="${height - 48}" text-anchor="end" font-family="VerazSocial, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="${COLORS.inkMuted}">veraz.app</text>
</svg>`;

  return Buffer.from(svg);
}

async function preparePhotoBuffer(
  photoPath: string,
  photo: { width: number; height: number },
  variant: SocialCardVariant,
) {
  let pipeline = sharp(photoPath).resize(photo.width, photo.height, { fit: "cover", position: "attention" });

  if (variant === "hero-gradient" || variant === "hero-gradient-vertical") {
    pipeline = pipeline.modulate({ brightness: 0.93, saturation: 1.06 }).linear(1.04, -(128 * 0.04));
  }

  return pipeline.png().toBuffer();
}

export async function renderSocialCard(input: RenderSocialCardInput): Promise<void> {
  const variant = input.variant ?? DEFAULT_SOCIAL_CARD_VARIANT;
  const layout = SOCIAL_CARD_VARIANTS[variant];
  const root = input.projectRoot ?? process.cwd();
  const fontBoldPath = path.join(root, "public/fonts/font/HelveticaNowDisplay-Bold.woff2");
  const fontMediumPath = path.join(root, "public/fonts/font/HelveticaNowDisplay-Medium.woff2");
  const fontPath = fontBoldPath;
  const logoPath = path.join(root, "public/verazicon.png");

  await mkdir(path.dirname(input.outputPath), { recursive: true });

  const { width, height, photo } = layout;

  const base =
    variant === "light-frame"
      ? sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 245, g: 245, b: 245, alpha: 1 },
          },
        })
      : sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 17, g: 17, b: 17, alpha: 1 },
          },
        });

  const photoBuffer = await preparePhotoBuffer(input.photoPath, photo, variant);

  const overlay = isHeroGradientVariant(variant)
      ? buildHeroGradientOverlay(input.title, input.sourceLabel, layout, fontBoldPath, fontMediumPath)
      : buildStandardOverlaySvg(
          variant as Exclude<SocialCardVariant, "hero-gradient" | "hero-gradient-vertical">,
          input.title,
          input.sourceLabel,
          layout,
          fontPath,
        );

  const composites: OverlayOptions[] = [
    { input: photoBuffer, left: photo.x, top: photo.y },
    { input: overlay, left: 0, top: 0 },
  ];

  try {
    const heroLogo = isHeroGradientVariant(variant) ? getHeroLogoPlacement(width) : null;
    const logoSize = heroLogo?.logoSize ?? 56;
    const logoLeft = heroLogo?.logoLeft ?? width - 52 - logoSize;
    const logoTop = heroLogo?.logoTop ?? 52;
    const logo = await sharp(logoPath).resize(logoSize, logoSize).png().toBuffer();
    composites.push({ input: logo, left: logoLeft, top: logoTop });
  } catch {
    // logo optional
  }

  await base.composite(composites).png().toFile(input.outputPath);
}

export { SOCIAL_CARD_VARIANTS, type SocialCardVariant };
