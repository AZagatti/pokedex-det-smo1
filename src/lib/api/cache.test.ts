import { beforeEach, describe, expect, it, vi } from "vitest";

import { cachedFetch } from "./cache";

describe("cachedFetch", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: 42 }),
        })
      )
    );
  });

  it("parses and returns the response", async () => {
    const result = await cachedFetch(
      "https://example.test/a",
      (d) => (d as { value: number }).value
    );
    expect(result).toBe(42);
  });

  it("caches subsequent requests to the same URL", async () => {
    await cachedFetch(
      "https://example.test/b",
      (d) => (d as { value: number }).value
    );
    await cachedFetch(
      "https://example.test/b",
      (d) => (d as { value: number }).value
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 404, statusText: "Not Found" })
      )
    );
    await expect(
      cachedFetch("https://example.test/missing", (d) => d)
    ).rejects.toThrow(/404/u);
  });
});
