#!/usr/bin/env npx tsx
/**
 * Video: tiktok, instagram_reels (ignora SOCIAL_PLATFORMS del feed).
 * Override: SOCIAL_VIDEO_PLATFORMS=tiktok,instagram_reels
 */
process.env.SOCIAL_PLATFORMS =
  process.env.SOCIAL_VIDEO_PLATFORMS?.trim() || "tiktok,instagram_reels";

import { runSocialPublish } from "./run-social-publish";

runSocialPublish()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
