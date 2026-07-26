import type { SocialPlatform } from "@/features/social-publishing/types";

export const VIDEO_SOCIAL_PLATFORMS: SocialPlatform[] = ["tiktok", "instagram_reels"];

export const FEED_IMAGE_PLATFORMS: SocialPlatform[] = ["x", "instagram"];

export function isVideoSocialPlatform(platform: SocialPlatform): boolean {
  return VIDEO_SOCIAL_PLATFORMS.includes(platform);
}

export function isFeedImagePlatform(platform: SocialPlatform): boolean {
  return FEED_IMAGE_PLATFORMS.includes(platform);
}

export function candidateNeedsReelMp4(platforms: SocialPlatform[]): boolean {
  return platforms.some(isVideoSocialPlatform);
}

export function candidateNeedsFeedPng(platforms: SocialPlatform[]): boolean {
  return platforms.some(isFeedImagePlatform);
}
