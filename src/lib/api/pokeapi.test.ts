import { describe, expect, it } from "vitest";

import { idFromUrl } from "./pokeapi";

describe("idFromUrl", () => {
  it("extracts the trailing id from a PokeAPI resource URL", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
  });

  it("handles urls without a trailing slash", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon-species/6")).toBe(6);
  });

  it("returns 0 when no id is present", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon/")).toBe(0);
  });
});
