import type { SocialCardLayout } from "@/features/social-publishing/templates/card-variants";

const COLORS = {
  bg: "#0a0a0a",
  ink: "#f5f5f5",
  inkSecondary: "#d4d4d4",
  inkMuted: "#a3a3a3",
  border: "rgba(255,255,255,0.14)",
  glass: "rgba(10,10,10,0.62)",
  accent: "#e5e5e5",
};

export type HeroLogoPlacement = {
  badgeLeft: number;
  badgeTop: number;
  badgeSize: number;
  logoLeft: number;
  logoTop: number;
  logoSize: number;
};

export function getHeroLogoPlacement(width: number): HeroLogoPlacement {
  const margin = 48;
  const logoSize = 96;
  const badgePad = 22;
  const badgeSize = logoSize + badgePad * 2;
  const badgeLeft = width - margin - badgeSize;
  const badgeTop = margin;
  return {
    badgeLeft,
    badgeTop,
    badgeSize,
    logoLeft: badgeLeft + badgePad,
    logoTop: badgeTop + badgePad,
    logoSize,
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === 0) lines.push(title.slice(0, maxCharsPerLine));

  const joined = lines.join(" ");
  if (joined.length < title.length && lines.length > 0) {
    const last = lines[lines.length - 1]!;
    lines[lines.length - 1] = `${last.slice(0, maxCharsPerLine - 1)}…`;
  }
  return lines.slice(0, maxLines);
}

export function buildHeroGradientOverlay(
  title: string,
  sourceLabel: string,
  layout: SocialCardLayout,
  fontBoldPath: string,
  fontMediumPath: string,
  overlayKind: "full" | "stock-video" = "full",
): Buffer {
  const { width, height } = layout;
  const isVertical = height > width;
  const stockVideo = overlayKind === "stock-video";
  /** Reels/TikTok: caption, usuario y botones tapan ~25–30% inferior */
  const reelUiSafeInset = isVertical ? (stockVideo ? 280 : 240) : 0;
  const marginX = 64;
  const marginBottom = (isVertical ? 72 : 56) + reelUiSafeInset;
  const titleFontSize = isVertical ? 56 : 54;
  const titleLineHeight = titleFontSize * 1.12;
  const titleLines = wrapTitle(title, isVertical ? 22 : 26, isVertical ? 4 : 3);
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const sourceRowHeight = 56;
  const footerCaptionHeight = 36;
  const contentGap = 28;

  const contentBottom = marginBottom + footerCaptionHeight;
  const sourceY = height - contentBottom - sourceRowHeight;
  const titleStartY = sourceY - contentGap - titleBlockHeight + titleFontSize * 0.85;

  const accentTop = titleStartY - titleFontSize * 0.75;
  const accentHeight = titleBlockHeight + titleFontSize * 0.5;

  const titleTspans = titleLines
    .map(
      (line, index) =>
        `<tspan x="${marginX + 28}" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const logo = getHeroLogoPlacement(width);
  const sourceLabelUpper = sourceLabel.toUpperCase();
  const topVignetteHeight = isVertical ? 420 : 340;
  const heroFadeInner = isVertical
    ? `<stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
      <stop offset="40%" stop-color="rgb(0,0,0)" stop-opacity="0.05"/>
      <stop offset="68%" stop-color="rgb(0,0,0)" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0.94"/>`
    : `<stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
      <stop offset="52%" stop-color="rgb(0,0,0)" stop-opacity="0.08"/>
      <stop offset="78%" stop-color="rgb(0,0,0)" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0.94"/>`;
  const pillWidth = Math.min(width - marginX * 2, Math.max(220, sourceLabelUpper.length * 15 + 56));
  const scrimStart =
    stockVideo && isVertical
      ? Math.max(0, height - marginBottom - titleBlockHeight - sourceRowHeight - contentGap - 120)
      : Math.floor(height * 0.4);

  const backgroundLayer = stockVideo
    ? `<rect width="${width}" height="320" fill="url(#topScrimSoft)"/>
       <rect y="${scrimStart}" width="${width}" height="${height - scrimStart}" fill="url(#bottomScrim)"/>`
    : `<rect width="${width}" height="${height}" fill="url(#heroFade)"/>
       <rect width="${width}" height="${topVignetteHeight}" fill="url(#topVignette)"/>
       <rect x="32" y="32" width="${width - 64}" height="${height - 64}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" rx="2"/>`;

  const logoBadgeLayer = stockVideo
    ? ""
    : `<g filter="url(#badgeShadow)">
         <rect x="${logo.badgeLeft}" y="${logo.badgeTop}" width="${logo.badgeSize}" height="${logo.badgeSize}" rx="26" fill="${COLORS.glass}" stroke="${COLORS.border}" stroke-width="1.5"/>
       </g>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
      ${heroFadeInner}
    </linearGradient>
    <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0.62"/>
      <stop offset="55%" stop-color="rgb(0,0,0)" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="topScrimSoft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bottomScrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
      <stop offset="35%" stop-color="rgb(0,0,0)" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0.92"/>
    </linearGradient>
    <linearGradient id="accentBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.accent}" stop-opacity="0.15"/>
      <stop offset="12%" stop-color="${COLORS.accent}" stop-opacity="1"/>
      <stop offset="88%" stop-color="${COLORS.accent}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${COLORS.accent}" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="titleShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
    <style>
      @font-face {
        font-family: 'VerazSocialBold';
        src: url('file://${fontBoldPath.replace(/\\/g, "/")}') format('woff2');
        font-weight: 700;
      }
      @font-face {
        font-family: 'VerazSocialMedium';
        src: url('file://${fontMediumPath.replace(/\\/g, "/")}') format('woff2');
        font-weight: 500;
      }
    </style>
  </defs>

  ${backgroundLayer}

  ${logoBadgeLayer}

  <rect x="${marginX}" y="${accentTop}" width="4" height="${accentHeight}" rx="2" fill="url(#accentBar)"/>

  <text filter="url(#titleShadow)" x="${marginX + 28}" y="${titleStartY}" font-family="VerazSocialBold, Helvetica, Arial, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.ink}" letter-spacing="-1.2">${titleTspans}</text>

  <line x1="${marginX}" y1="${sourceY - 14}" x2="${width - marginX}" y2="${sourceY - 14}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

  <rect x="${marginX}" y="${sourceY}" width="${pillWidth}" height="52" rx="14" fill="${COLORS.glass}" stroke="${COLORS.border}" stroke-width="1.5"/>
  <circle cx="${marginX + 28}" cy="${sourceY + 26}" r="4" fill="${COLORS.accent}"/>
  <text x="${marginX + 44}" y="${sourceY + 34}" font-family="VerazSocialMedium, Helvetica, Arial, sans-serif" font-size="22" font-weight="500" fill="${COLORS.inkSecondary}" letter-spacing="2.2">${escapeXml(sourceLabelUpper)}</text>

  <text x="${marginX}" y="${height - marginBottom + 4}" font-family="VerazSocialMedium, Helvetica, Arial, sans-serif" font-size="20" font-weight="500" fill="${COLORS.inkMuted}" letter-spacing="3">VERAZ · INFORMAR SIN INFLUENCIAR</text>
  <text x="${width - marginX}" y="${height - marginBottom + 4}" text-anchor="end" font-family="VerazSocialMedium, Helvetica, Arial, sans-serif" font-size="20" font-weight="500" fill="${COLORS.inkMuted}" letter-spacing="1.5">veraz.app</text>
</svg>`;

  return Buffer.from(svg);
}
