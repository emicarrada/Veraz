import { describe, expect, it } from "vitest";

import { computePillHoverGeometry } from "@/components/ui/pill-nav/pill-hover-geometry";

describe("computePillHoverGeometry", () => {
  it("uses modest scale for wide pills", () => {
    const wide = computePillHoverGeometry(120, 32);
    const narrow = computePillHoverGeometry(36, 32);
    expect(wide.targetScale).toBeGreaterThanOrEqual(1.2);
    expect(wide.targetScale).toBeLessThan(narrow.targetScale);
  });

  it("increases scale for narrow pills like EN/ES locale toggle", () => {
    const geometry = computePillHoverGeometry(36, 32);
    expect(geometry.targetScale).toBeGreaterThan(1.5);
  });

  it("returns positive layout values", () => {
    const geometry = computePillHoverGeometry(40, 32);
    expect(geometry.diameter).toBeGreaterThan(0);
    expect(geometry.delta).toBeGreaterThan(0);
    expect(geometry.originY).toBeGreaterThan(0);
  });
});
