import { readFile } from "node:fs/promises";
import path from "node:path";

const TELEGRAM_MESSAGE_MAX = 4096;

export type TelegramDeliverVideoInput = {
  botToken: string;
  chatId: string;
  videoPath: string;
  /** Solo descripción + hashtags (mensaje aparte para copiar/pegar) */
  copyCaption: string;
  /** Notas opcionales (sonido TikTok, slug, Reels) */
  notes?: string;
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

async function sendTextMessages(botToken: string, chatId: string, text: string): Promise<{ ok: boolean; description?: string }> {
  let rest = text.trim();
  if (!rest) return { ok: true };

  while (rest.length > 0) {
    const chunk = rest.slice(0, TELEGRAM_MESSAGE_MAX);
    rest = rest.slice(TELEGRAM_MESSAGE_MAX);
    const msg = await telegramPost(botToken, "sendMessage", {
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: "true",
    });
    if (!msg.ok) {
      return msg;
    }
  }
  return { ok: true };
}

/** Video sin caption + descripción en mensaje aparte (+ notas opcionales). */
export async function sendTelegramVideoPackage(
  input: TelegramDeliverVideoInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { botToken, chatId, videoPath, copyCaption, notes } = input;
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
  form.append("video", new Blob([new Uint8Array(videoBytes)]), path.basename(videoPath));

  const videoResult = await telegramPost(botToken, "sendVideo", form);
  if (!videoResult.ok) {
    return { ok: false, error: `Telegram sendVideo: ${videoResult.description ?? "error"}` };
  }

  const captionResult = await sendTextMessages(botToken, chatId, copyCaption.trim());
  if (!captionResult.ok) {
    return { ok: false, error: `Telegram caption: ${captionResult.description ?? "error"}` };
  }

  if (notes?.trim()) {
    const notesResult = await sendTextMessages(botToken, chatId, notes.trim());
    if (!notesResult.ok) {
      return { ok: false, error: `Telegram notes: ${notesResult.description ?? "error"}` };
    }
  }

  return { ok: true };
}
