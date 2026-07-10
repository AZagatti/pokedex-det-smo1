import { cachedFetch } from "./cache";
import {
  BerrySchema,
  EvolutionChainSchema,
  PokemonListResponseSchema,
  PokemonSchema,
  PokemonSpeciesSchema,
} from "./schemas";
import type {
  Berry,
  EvolutionChain,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
} from "./schemas";

const BASE_URL = "https://pokeapi.co/api/v2";

export function listPokemon(
  limit: number,
  offset: number
): Promise<PokemonListResponse> {
  return cachedFetch(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    (d) => PokemonListResponseSchema.parse(d)
  );
}

export function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  return cachedFetch(`${BASE_URL}/pokemon/${nameOrId}`, (d) =>
    PokemonSchema.parse(d)
  );
}

export function getPokemonSpecies(
  nameOrId: string | number
): Promise<PokemonSpecies> {
  return cachedFetch(`${BASE_URL}/pokemon-species/${nameOrId}`, (d) =>
    PokemonSpeciesSchema.parse(d)
  );
}

export function getEvolutionChain(url: string): Promise<EvolutionChain> {
  return cachedFetch(url, (d) => EvolutionChainSchema.parse(d));
}

export function listBerries(
  limit: number,
  offset: number
): Promise<PokemonListResponse> {
  return cachedFetch(`${BASE_URL}/berry?limit=${limit}&offset=${offset}`, (d) =>
    PokemonListResponseSchema.parse(d)
  );
}

export function getBerry(nameOrId: string | number): Promise<Berry> {
  return cachedFetch(`${BASE_URL}/berry/${nameOrId}`, (d) =>
    BerrySchema.parse(d)
  );
}

export function idFromUrl(url: string): number {
  const match = url.match(/\/(?<id>\d+)\/?$/u);
  return match ? Number(match.groups?.id) : 0;
}
