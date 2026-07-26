import type { SocialPlatform } from "@/features/social-publishing/types";

export type SocialPublishResult =
  | { ok: true; externalPostId?: string }
  | { ok: false; error: string };

export type SocialNetworkPublishInput = {
  platform: SocialPlatform;
  caption: string;
  imagePath?: string;
  videoPath?: string;
  youtubeTitle?: string;
  profileDir: string;
  headed: boolean;
  pauseOnErrorMs?: number;
};

export type SocialNetworkPublisher = (
  input: SocialNetworkPublishInput,
) => Promise<SocialPublishResult>;
