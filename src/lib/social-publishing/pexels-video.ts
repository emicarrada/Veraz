const USER_AGENT = "Veraz-Social-Publish/1.0";
const PEXELS_API = "https://api.pexels.com/videos/search";

export type PexelsVideoPick = {
  id: number;
  pageUrl: string;
  downloadUrl: string;
  width: number;
  height: number;
  query: string;
};

type PexelsVideoFile = {
  id: number;
  quality?: string;
  file_type?: string;
  width: number;
  height: number;
  link: string;
};

type PexelsVideo = {
  id: number;
  url: string;
  video_files: PexelsVideoFile[];
};

type PexelsSearchResponse = {
  videos?: PexelsVideo[];
};

function pickBestFile(files: PexelsVideoFile[]): PexelsVideoFile | null {
  const mp4 = files.filter((f) => f.file_type === "video/mp4" || f.link.endsWith(".mp4"));
  if (mp4.length === 0) return null;

  const portrait = mp4.filter((f) => f.height >= f.width);
  const pool = portrait.length > 0 ? portrait : mp4;

  pool.sort((a, b) => {
    const score = (f: PexelsVideoFile) => {
      const portraitBonus = f.height >= f.width ? 500 : 0;
      const heightTarget = Math.abs(f.height - 1920);
      const widthOk = f.width >= 720 ? 200 : 0;
      return portraitBonus + widthOk - heightTarget * 0.1;
    };
    return score(b) - score(a);
  });

  return pool[0] ?? null;
}

export async function searchPexelsVideo(
  apiKey: string,
  query: string,
): Promise<PexelsVideoPick | null> {
  const url = new URL(PEXELS_API);
  url.searchParams.set("query", query.slice(0, 80));
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("size", "medium");
  url.searchParams.set("per_page", "8");

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels HTTP ${response.status}`);
  }

  const data = (await response.json()) as PexelsSearchResponse;
  for (const video of data.videos ?? []) {
    const file = pickBestFile(video.video_files ?? []);
    if (!file) continue;
    return {
      id: video.id,
      pageUrl: video.url,
      downloadUrl: file.link,
      width: file.width,
      height: file.height,
      query,
    };
  }
  return null;
}

export function isPexelsConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.PEXELS_API_KEY?.trim());
}
