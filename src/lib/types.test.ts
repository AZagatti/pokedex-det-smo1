import { describe, expect, it } from "vitest";

import { typeColor, GENERATIONS } from "./types";

describe("typeColor", () => {
  it("returns known color for a valid type", () => {
    expect(typeColor("fire")).toBe("#f08030");
  });

  it("falls back to a default color for unknown types", () => {
    expect(typeColor("unknown-type")).toBe("#777");
  });
});

describe("GENERATIONS", () => {
  it("covers generation I starting at 1", () => {
    expect(GENERATIONS[0]).toMatchObject({ id: 1, range: [1, 151] });
  });

  it("has no gaps between consecutive generations", () => {
    for (let i = 1; i < GENERATIONS.length; i += 1) {
      expect(GENERATIONS[i].range[0]).toBe(GENERATIONS[i - 1].range[1] + 1);
    }
  });
});
