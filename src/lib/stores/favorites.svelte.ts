import { browser } from "$app/environment";

const STORAGE_KEY = "pokedex-favorites";

function readStored(): string[] {
  if (!browser) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function createFavoritesStore() {
  let names = $state<string[]>(readStored());

  function persist() {
    if (!browser) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  }

  return {
    has(name: string) {
      return names.includes(name);
    },
    toggle(name: string) {
      names = names.includes(name)
        ? names.filter((n) => n !== name)
        : [...names, name];
      persist();
    },
    get value() {
      return names;
    },
  };
}

export const favoritesStore = createFavoritesStore();
