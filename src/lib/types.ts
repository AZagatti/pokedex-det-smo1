export const TYPE_COLORS: Record<string, string> = {
  bug: "#a8b820",
  dark: "#705848",
  dragon: "#7038f8",
  electric: "#f8d030",
  fairy: "#ee99ac",
  fighting: "#c03028",
  fire: "#f08030",
  flying: "#a890f0",
  ghost: "#705898",
  grass: "#78c850",
  ground: "#e0c068",
  ice: "#98d8d8",
  normal: "#a8a878",
  poison: "#a040a0",
  psychic: "#f85888",
  rock: "#b8a038",
  steel: "#b8b8d0",
  water: "#6890f0",
};

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#777";
}

export const GENERATIONS = [
  { id: 1, label: "Gen I", range: [1, 151] },
  { id: 2, label: "Gen II", range: [152, 251] },
  { id: 3, label: "Gen III", range: [252, 386] },
  { id: 4, label: "Gen IV", range: [387, 493] },
  { id: 5, label: "Gen V", range: [494, 649] },
  { id: 6, label: "Gen VI", range: [650, 721] },
  { id: 7, label: "Gen VII", range: [722, 809] },
  { id: 8, label: "Gen VIII", range: [810, 905] },
  { id: 9, label: "Gen IX", range: [906, 1025] },
] as const;
