import { describe, expect, it } from "vitest";

import { resolveFeedLane } from "@/lib/repositories/contracts/feed-lane";

const home = ["la-jornada", "la-jornada-cultura", "reforma", "xataka-mx"];
const lead = ["la-jornada-cultura"];

describe("resolveFeedLane", () => {
  it("puts a home culture story with its own photo ahead of everything", () => {
    expect(resolveFeedLane("la-jornada-cultura", "general", home, lead, true)).toBe(0);
    expect(resolveFeedLane("la-jornada", "cultura", home, lead, true)).toBe(0);
  });

  it("keeps other home photos ahead of text-only culture", () => {
    expect(resolveFeedLane("xataka-mx", "tecnologia", home, lead, true)).toBe(1);
    expect(resolveFeedLane("la-jornada-cultura", "cultura", home, lead, false)).toBe(2);
    expect(resolveFeedLane("reforma", "politica", home, lead, false)).toBe(3);
  });

  it("puts foreign photos ahead of foreign text", () => {
    expect(resolveFeedLane("el-pais", "cultura", home, lead, true)).toBe(4);
    expect(resolveFeedLane("el-pais", "politica", home, lead, false)).toBe(5);
  });
});