import { loadSocialPublishConfig } from "@/features/social-publishing/load-config";
import type { SocialPublishConfig } from "@/features/social-publishing/types";

export type SocialVideoDeliveryChannel = "telegram" | "none";

export type SocialVideoDeliveryConfig = {
  base: SocialPublishConfig;
  channel: SocialVideoDeliveryChannel;
  telegramBotToken: string;
  telegramChatId: string;
  maxDeliveriesPerDay: number;
  includeInstagramReelsCaption: boolean;
};

function parseIntEnv(value: string | undefined, defaultValue: number, min: number, max: number): number {
  const raw = value?.trim();
  if (!raw) return defaultValue;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return defaultValue;
  return Math.max(min, Math.min(max, n));
}

export function loadSocialVideoDeliveryConfig(env: NodeJS.ProcessEnv = process.env): SocialVideoDeliveryConfig {
  const base = loadSocialPublishConfig(env);
  const channelRaw = env.SOCIAL_VIDEO_DELIVERY?.trim().toLowerCase() ?? "none";
  const channel: SocialVideoDeliveryChannel =
    channelRaw === "none" || channelRaw === "off" || channelRaw === "false" ? "none" : "telegram";

  return {
    base: {
      ...base,
      dryRun: false,
      publishNetworks: false,
      platforms: ["tiktok"],
      maxPostsPerRun: 1,
    },
    channel,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN?.trim() ?? "",
    telegramChatId: env.TELEGRAM_CHAT_ID?.trim() ?? "",
    maxDeliveriesPerDay: parseIntEnv(env.SOCIAL_VIDEO_DELIVERY_MAX_PER_DAY, 8, 1, 24),
    includeInstagramReelsCaption: env.SOCIAL_VIDEO_DELIVERY_INCLUDE_REELS_CAPTION?.trim().toLowerCase() !== "false",
  };
}
