import { describe, expect, it } from "vitest";

import {
  isSharpEnough,
  preferSharperImageUrl,
  readImageSize,
} from "@/lib/news-ingestion/images/feed-image";

describe("feed image quality", () => {
  it("accepts a card-sized photo and rejects a thumbnail", () => {
    expect(isSharpEnough({ width: 1024, height: 679 })).toBe(true);
    expect(isSharpEnough({ width: 800, height: 450 })).toBe(true);
    expect(isSharpEnough({ width: 576, height: 1024 })).toBe(true);
    expect(isSharpEnough({ width: 400, height: 300 })).toBe(false);
    expect(isSharpEnough({ width: 150, height: 150 })).toBe(false);
  });

  it("asks Weblogs for the 1024 rendition instead of a small one", () => {
    expect(
      preferSharperImageUrl("https://i.blogs.es/03b15a/portada/450_1000.jpeg"),
    ).toBe("https://i.blogs.es/03b15a/portada/1024_2000.jpeg");
    expect(
      preferSharperImageUrl("https://i.blogs.es/03b15a/portada/1024_2000.jpeg"),
    ).toBe("https://i.blogs.es/03b15a/portada/1024_2000.jpeg");
  });

  it("reads PNG and JPEG dimensions from the header", () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47], 0);
    png[16] = 0;
    png[17] = 0;
    png[18] = 0x04;
    png[19] = 0;
    png[20] = 0;
    png[21] = 0;
    png[22] = 0x03;
    png[23] = 0;
    expect(readImageSize(png)).toEqual({ width: 1024, height: 768 });

    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0xbc, 0x04, 0x00,
    ]);
    expect(readImageSize(jpeg)).toEqual({ width: 1024, height: 700 });
  });
});
