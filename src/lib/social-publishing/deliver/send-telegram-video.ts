import { readFile } from "node:fs/promises";
import path from "node:path";

const TELEGRAM_VIDEO_CAPTION_MAX = 1024;
const TELEGRAM_MESSAGE_MAX = 4096;

export type TelegramDeliverVideoInput = {
  botToken: string;
  chatId: string;
  videoPath: string;
  /** Short label on the video attachment */
  videoCaption: string;
  /** Full copy-paste text (caption + hints) sent as a follow-up message */
  fullText: string;
};

async function telegramPost(
  botToken: string,
  method: string,
  body: FormData | Record<string, string>,
): Promise<{ ok: boolean; description?: string }> {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const init: RequestInit =
    body instanceof FormData
      ? { method: "POST", body }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        };

  const res = await fetch(url, init);
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!res.ok || !json.ok) {
    return { ok: false, description: json.description ?? `HTTP ${res.status}` };
  }
  return { ok: true };
}

function trimTelegram(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/** Sends MP4 + full caption text to a Telegram chat (Bot API). */
export async function sendTelegramVideoPackage(input: TelegramDeliverVideoInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const { botToken, chatId, videoPath, videoCaption, fullText } = input;
  if (!botToken || !chatId) {
    return { ok: false, error: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID." };
  }

  let videoBytes: Buffer;
  try {
    videoBytes = await readFile(videoPath);
  } catch {
    return { ok: false, error: `No se pudo leer el video: ${videoPath}` };
  }

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("supports_streaming", "true");
  form.append("caption", trimTelegram(videoCaption, TELEGRAM_VIDEO_CAPTION_MAX));
  form.append("video", new Blob([new Uint8Array(videoBytes)]), path.basename(videoPath));

  const videoResult = await telegramPost(botToken, "sendVideo", form);
  if (!videoResult.ok) {
    return { ok: false, error: `Telegram sendVideo: ${videoResult.description ?? "error"}` };
  }

  const chunks: string[] = [];
  let rest = fullText.trim();
  while (rest.length > 0) {
    chunks.push(rest.slice(0, TELEGRAM_MESSAGE_MAX));
    rest = rest.slice(TELEGRAM_MESSAGE_MAX);
  }

  for (const chunk of chunks) {
    const msg = await telegramPost(botToken, "sendMessage", {
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: "false",
    });
    if (!msg.ok) {
      return { ok: false, error: `Telegram sendMessage: ${msg.description ?? "error"}` };
    }
  }

  return { ok: true };
}
