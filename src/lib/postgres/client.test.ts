import { describe, expect, it } from "vitest";

import { resolvePostgresSsl } from "@/lib/postgres/client";

describe("resolvePostgresSsl", () => {
  it("disables SSL for localhost", () => {
    expect(resolvePostgresSsl("postgres://veraz:x@localhost:5432/veraz")).toBe(false);
    expect(resolvePostgresSsl("postgres://veraz:x@127.0.0.1:5432/veraz")).toBe(false);
  });

  it("disables SSL when the URL asks for it", () => {
    expect(
      resolvePostgresSsl("postgres://veraz:x@db.example:5432/veraz?sslmode=disable"),
    ).toBe(false);
  });

  it("uses opportunistic SSL for remote hosts", () => {
    expect(resolvePostgresSsl("postgres://veraz:x@3.87.109.197:5432/veraz")).toEqual({
      rejectUnauthorized: false,
    });
  });
});
