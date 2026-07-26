import type { SocialPlatform } from "@/features/social-publishing/types";
import { isVideoSocialPlatform } from "@/features/social-publishing/platform-media";
import { assertSocialProfileReady } from "@/lib/social-publishing/publish/playwright-context";
import { profileDirForPlatform } from "@/lib/social-publishing/publish/index";

function assertYoutubeReady(env: NodeJS.ProcessEnv): string | null {
  if (!env.YOUTUBE_CLIENT_ID?.trim() || !env.YOUTUBE_CLIENT_SECRET?.trim()) {
    return "YouTube: falta YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET (Google Cloud OAuth Desktop).";
  }
  if (!env.YOUTUBE_REFRESH_TOKEN?.trim()) {
    return "YouTube: falta YOUTUBE_REFRESH_TOKEN. Ejecuta: npm run social:youtube-auth";
  }
  return null;
}

export async function assertSocialPublishReady(
  platforms: SocialPlatform[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<string | null> {
  for (const platform of platforms) {
    if (platform === "youtube") {
      const yt = assertYoutubeReady(env);
      if (yt) return yt;
      continue;
    }
    if (isVideoSocialPlatform(platform) && platform === "tiktok") {
      const err = await assertSocialProfileReady(profileDirForPlatform(platform, env), platform);
      if (err) return err;
      continue;
    }
    if (platform === "instagram_reels") {
      const err = await assertSocialProfileReady(
        profileDirForPlatform("instagram", env),
        "instagram",
      );
      if (err) return err;
      continue;
    }
    const err = await assertSocialProfileReady(profileDirForPlatform(platform, env), platform);
    if (err) return err;
  }
  return null;
}
