const cache = new Map<string, unknown>();

export async function cachedFetch<T>(
  url: string,
  parse: (data: unknown) => T
): Promise<T> {
  const hit = cache.get(url);
  if (hit !== undefined) {
    return hit as T;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Request failed: ${res.status} ${res.statusText} for ${url}`
    );
  }
  const json = await res.json();
  const parsed = parse(json);
  cache.set(url, parsed);
  return parsed;
}
