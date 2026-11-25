/** Long edge that still looks sharp on the lead card, without asking for a huge original. */
export const FEED_IMAGE_MIN_LONG_EDGE = 800;
/** Short edge below this looks soft once the card crops it. */
export const FEED_IMAGE_MIN_SHORT_EDGE = 400;

export type ImageSize = {
  width: number;
  height: number;
};

export function isSharpEnough(size: ImageSize): boolean {
  const longEdge = Math.max(size.width, size.height);
  const shortEdge = Math.min(size.width, size.height);
  return longEdge >= FEED_IMAGE_MIN_LONG_EDGE && shortEdge >= FEED_IMAGE_MIN_SHORT_EDGE;
}

/**
 * Weblogs SL serves a resized file in the path (`450_1000.jpeg`).
 * Ask for the 1024-wide rendition, which is sharp on the card and not a full original.
 */
export function preferSharperImageUrl(url: string): string {
  return url.replace(
    /\/(\d{2,4})_(\d{2,4})\.(jpe?g|png|webp)(?=$|[?#])/i,
    (_match, width: string, _height: string, ext: string) => {
      const parsed = Number(width);
      if (!Number.isFinite(parsed) || parsed >= FEED_IMAGE_MIN_LONG_EDGE) {
        return `/${width}_${_height}.${ext}`;
      }
      return `/1024_2000.${ext}`;
    },
  );
}

export function readImageSize(bytes: Uint8Array): ImageSize | null {
  return readPngSize(bytes) ?? readGifSize(bytes) ?? readWebpSize(bytes) ?? readJpegSize(bytes);
}

function readU16(bytes: Uint8Array, offset: number, littleEndian: boolean): number {
  if (offset + 2 > bytes.length) return 0;
  const hi = bytes[offset] ?? 0;
  const lo = bytes[offset + 1] ?? 0;
  return littleEndian ? lo * 256 + hi : hi * 256 + lo;
}

function readU24(bytes: Uint8Array, offset: number): number {
  if (offset + 3 > bytes.length) return 0;
  return ((bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) | ((bytes[offset + 2] ?? 0) << 16));
}

function readU32(bytes: Uint8Array, offset: number): number {
  if (offset + 4 > bytes.length) return 0;
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  );
}

function readPngSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50) return null;
  const width = readU32(bytes, 16);
  const height = readU32(bytes, 20);
  if (width < 1 || height < 1) return null;
  return { width, height };
}

function readGifSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 10 || bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) return null;
  const width = readU16(bytes, 6, true);
  const height = readU16(bytes, 8, true);
  if (width < 1 || height < 1) return null;
  return { width, height };
}

function readWebpSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 30) return null;
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") return null;
  const format = ascii(bytes, 12, 4);
  if (format === "VP8X" && bytes.length >= 30) {
    return {
      width: readU24(bytes, 24) + 1,
      height: readU24(bytes, 27) + 1,
    };
  }
  if (format === "VP8 " && bytes.length >= 30) {
    return {
      width: readU16(bytes, 26, true) & 0x3fff,
      height: readU16(bytes, 28, true) & 0x3fff,
    };
  }
  if (format === "VP8L" && bytes.length >= 25) {
    const b1 = bytes[21] ?? 0;
    const b2 = bytes[22] ?? 0;
    const b3 = bytes[23] ?? 0;
    const b4 = bytes[24] ?? 0;
    return {
      width: (b1 | ((b2 & 0x3f) << 8)) + 1,
      height: (((b2 & 0xc0) >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10)) + 1,
    };
  }
  return null;
}

function readJpegSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1] ?? 0;
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      const height = readU16(bytes, offset + 5, false);
      const width = readU16(bytes, offset + 7, false);
      if (width < 1 || height < 1) return null;
      return { width, height };
    }
    const segmentLength = readU16(bytes, offset + 2, false);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }
  return null;
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index += 1) {
    text += String.fromCharCode(bytes[offset + index] ?? 0);
  }
  return text;
}
