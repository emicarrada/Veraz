export type SocialCardVariant = "editorial" | "light-frame" | "hero-gradient" | "hero-gradient-vertical";

export function isHeroGradientVariant(variant: SocialCardVariant): boolean {
  return variant === "hero-gradient" || variant === "hero-gradient-vertical";
}

export type SocialCardLayout = {
  width: number;
  height: number;
  photo: { x: number; y: number; width: number; height: number };
};

export const SOCIAL_CARD_VARIANTS: Record<SocialCardVariant, SocialCardLayout & { label: string }> =
  {
    editorial: {
      label: "Editorial oscuro (marca Veraz)",
      width: 1080,
      height: 1080,
      photo: { x: 0, y: 0, width: 1080, height: 580 },
    },
    "light-frame": {
      label: "Marco claro",
      width: 1080,
      height: 1080,
      photo: { x: 48, y: 48, width: 984, height: 520 },
    },
    "hero-gradient": {
      label: "Foto full + degradado",
      width: 1080,
      height: 1080,
      photo: { x: 0, y: 0, width: 1080, height: 1080 },
    },
    "hero-gradient-vertical": {
      label: "Reels / TikTok 9:16",
      width: 1080,
      height: 1920,
      photo: { x: 0, y: 0, width: 1080, height: 1920 },
    },
  };

export const DEFAULT_SOCIAL_CARD_VARIANT: SocialCardVariant = "hero-gradient";
