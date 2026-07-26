import { readFile } from "node:fs/promises";

import type { SocialNetworkPublishInput, SocialPublishResult } from "@/lib/social-publishing/publish/types";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

async function fetchAccessToken(env: NodeJS.ProcessEnv): Promise<string> {
  const clientId = env.YOUTUBE_CLIENT_ID?.trim();
  const clientSecret = env.YOUTUBE_CLIENT_SECRET?.trim();
  const refreshToken = env.YOUTUBE_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "YouTube: configura YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET y YOUTUBE_REFRESH_TOKEN (npm run social:youtube-auth).",
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YouTube token refresh failed: ${response.status} ${text.slice(0, 200)}`);
  }

  const json = (await response.json()) as TokenResponse;
  return json.access_token;
}

/**
 * YouTube Shorts via Data API (resumable upload). OAuth once: npm run social:youtube-auth
 */
export async function publishToYoutube(
  input: SocialNetworkPublishInput,
  env: NodeJS.ProcessEnv = process.env,
): Promise<SocialPublishResult> {
  if (!input.videoPath) {
    return { ok: false, error: "Falta videoPath para YouTube." };
  }

  try {
    const accessToken = await fetchAccessToken(env);
    const title = (input.youtubeTitle ?? input.caption.split("\n")[0] ?? "Veraz").slice(0, 100);
    const description = input.caption;

    const initUrl = new URL("https://www.googleapis.com/upload/youtube/v3/videos");
    initUrl.searchParams.set("uploadType", "resumable");
    initUrl.searchParams.set("part", "snippet,status");

    const metadata = {
      snippet: {
        title,
        description,
        categoryId: "25",
      },
      status: {
        privacyStatus: env.YOUTUBE_PRIVACY?.trim() || "public",
        selfDeclaredMadeForKids: false,
      },
    };

    const initResponse = await fetch(initUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/mp4",
      },
      body: JSON.stringify(metadata),
    });

    if (!initResponse.ok) {
      const text = await initResponse.text();
      return { ok: false, error: `YouTube init upload: ${initResponse.status} ${text.slice(0, 300)}` };
    }

    const uploadUrl = initResponse.headers.get("location");
    if (!uploadUrl) {
      return { ok: false, error: "YouTube no devolvió URL de subida resumable." };
    }

    const videoBytes = await readFile(input.videoPath);
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(videoBytes.length),
      },
      body: videoBytes,
    });

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      return { ok: false, error: `YouTube upload: ${uploadResponse.status} ${text.slice(0, 300)}` };
    }

    const result = (await uploadResponse.json()) as { id?: string };
    return { ok: true, ...(result.id ? { externalPostId: result.id } : {}) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}
