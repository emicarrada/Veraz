import { describe, expect, it } from "vitest";

import { formatIntervalSpanish } from "@/features/news/utils/format-update-interval";
import { getFeedHeaderDescription } from "@/features/news/utils/get-feed-header-description";

describe("formatIntervalSpanish", () => {
  it("formats minutes", () => {
    expect(formatIntervalSpanish(120)).toBe("2 minutos");
    expect(formatIntervalSpanish(60)).toBe("1 minuto");
  });

  it("formats hours", () => {
    expect(formatIntervalSpanish(900)).toBe("15 minutos");
    expect(formatIntervalSpanish(3600)).toBe("1 hora");
  });
});

describe("getFeedHeaderDescription", () => {
  it("includes update intervals for the general feed", () => {
    const description = getFeedHeaderDescription();
    expect(description).toContain("Lo esencial, ordenado por fecha");
    expect(description).toContain("Las fuentes se revisan cada");
    expect(description).toContain("el feed se actualiza cada");
  });

  it("returns vertical copy for finanzas and tecnologia", () => {
    expect(getFeedHeaderDescription("economia")).toContain("CNBC");
    expect(getFeedHeaderDescription("tecnologia")).toContain("TechCrunch");
    expect(getFeedHeaderDescription("mercados")).toContain("CNBC");
  });
});
