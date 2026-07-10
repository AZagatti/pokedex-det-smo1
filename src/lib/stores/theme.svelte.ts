import { browser } from "$app/environment";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "pokedex-theme";

function getInitialTheme(): ThemeMode {
  if (!browser) {
    return "light";
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function createThemeStore() {
  let mode = $state<ThemeMode>(getInitialTheme());

  function apply(value: ThemeMode) {
    if (!browser) {
      return;
    }
    document.documentElement.dataset.theme = value;
    localStorage.setItem(STORAGE_KEY, value);
  }

  return {
    init() {
      apply(mode);
    },
    get mode() {
      return mode;
    },
    toggle() {
      mode = mode === "light" ? "dark" : "light";
      apply(mode);
    },
  };
}

export const theme = createThemeStore();
