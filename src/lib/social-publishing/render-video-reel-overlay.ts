import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { SOCIAL_CARD_VARIANTS } from "@/features/social-publishing/templates/card-variants";
import {
  buildHeroGradientOverlay,
  getHeroLogoPlacement,
} from "@/lib/social-publishing/hero-gradient-overlay";

export type RenderVideoReelOverlayInput = {
  title: string;
  sourceLabel: string;
  outputPath: string;
  projectRoot?: string;
};

/**
 * Transparent PNG (scrims + titular + fuente) to composite over stock video.
 */
export async function renderVideoReelOverlay(input: RenderVideoReelOverlayInput): Promise<void> {
  const root = input.projectRoot ?? process.cwd();
  const layout = SOCIAL_CARD_VARIANTS["hero-gradient-vertical"];
  const fontBoldPath = path.join(root, "public/fonts/font/HelveticaNowDisplay-Bold.woff2");
  const fontMediumPath = path.join(root, "public/fonts/font/HelveticaNowDisplay-Medium.woff2");
  const logoPath = path.join(root, "public/verazicon.png");

  await mkdir(path.dirname(input.outputPath), { recursive: true });

  const { width } = layout;
  const overlaySvg = buildHeroGradientOverlay(
    input.title,
    input.sourceLabel,
    layout,
    fontBoldPath,
    fontMediumPath,
    "stock-video",
  );

  const logo = await sharp(logoPath).resize(96, 96).png().toBuffer();
  const heroLogo = getHeroLogoPlacement(width);

  await sharp(overlaySvg)
    .ensureAlpha()
    .composite([{ input: logo, left: heroLogo.logoLeft, top: heroLogo.logoTop }])
    .png()
    .toFile(input.outputPath);
}
