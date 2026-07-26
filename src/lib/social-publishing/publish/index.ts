import type { SocialPlatform } from "@/features/social-publishing/types";
import { publishToInstagram } from "@/lib/social-publishing/publish/publish-instagram";
import { publishToInstagramReels } from "@/lib/social-publishing/publish/publish-instagram-reels";
import { publishToTikTok } from "@/lib/social-publishing/publish/publish-tiktok";
import { publishToX } from "@/lib/social-publishing/publish/publish-x";
import { publishToYoutube } from "@/lib/social-publishing/publish/publish-youtube";
import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";

export async function publishToSocialNetwork(
  input: SocialNetworkPublishInput,
): Promise<SocialPublishResult> {
  switch (input.platform) {
    case "x":
      return publishToX(input);
    case "instagram":
      return publishToInstagram(input);
    case "instagram_reels":
      return publishToInstagramReels(input);
    case "tiktok":
      return publishToTikTok(input);
    case "youtube":
      return publishToYoutube(input);
    default:
      return { ok: false, error: `Unknown platform: ${input.platform as SocialPlatform}` };
  }
}

export function profileDirForPlatform(platform: SocialPlatform, env: NodeJS.ProcessEnv): string {
  switch (platform) {
    case "x":
      return env.SOCIAL_X_PROFILE_DIR?.trim() || ".social/x-profile";
    case "instagram":
    case "instagram_reels":
      return env.SOCIAL_INSTAGRAM_PROFILE_DIR?.trim() || ".social/instagram-profile";
    case "tiktok":
      return env.SOCIAL_TIKTOK_PROFILE_DIR?.trim() || ".social/tiktok-profile";
    case "youtube":
      return env.SOCIAL_YOUTUBE_PROFILE_DIR?.trim() || ".social/youtube-profile";
    default:
      return ".social/profile";
  }
}
