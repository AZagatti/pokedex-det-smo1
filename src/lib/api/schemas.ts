import { z } from "zod";

export const NamedApiResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const PokemonListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(NamedApiResourceSchema),
});
export type PokemonListResponse = z.infer<typeof PokemonListResponseSchema>;

export const PokemonTypeSlotSchema = z.object({
  slot: z.number(),
  type: NamedApiResourceSchema,
});

export const PokemonAbilitySlotSchema = z.object({
  ability: NamedApiResourceSchema,
  is_hidden: z.boolean(),
  slot: z.number(),
});

export const PokemonStatSchema = z.object({
  base_stat: z.number(),
  effort: z.number(),
  stat: NamedApiResourceSchema,
});

export const PokemonMoveSchema = z.object({
  move: NamedApiResourceSchema,
});

export const PokemonSpritesSchema = z
  .object({
    back_default: z.string().nullable().optional(),
    back_shiny: z.string().nullable().optional(),
    front_default: z.string().nullable().optional(),
    front_shiny: z.string().nullable().optional(),
    other: z
      .object({
        "official-artwork": z
          .object({
            front_default: z.string().nullable().optional(),
          })
          .optional(),
        home: z
          .object({
            front_default: z.string().nullable().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .passthrough();

export const PokemonSchema = z
  .object({
    abilities: z.array(PokemonAbilitySlotSchema),
    base_experience: z.number().nullable().optional(),
    cries: z
      .object({
        latest: z.string().nullable().optional(),
        legacy: z.string().nullable().optional(),
      })
      .optional(),
    height: z.number(),
    id: z.number(),
    moves: z.array(PokemonMoveSchema),
    name: z.string(),
    species: NamedApiResourceSchema,
    sprites: PokemonSpritesSchema,
    stats: z.array(PokemonStatSchema),
    types: z.array(PokemonTypeSlotSchema),
    weight: z.number(),
  })
  .passthrough();
export type Pokemon = z.infer<typeof PokemonSchema>;

export const EvolutionChainLinkSchema: z.ZodType<EvolutionChainLink> = z.lazy(
  () =>
    z.object({
      evolves_to: z.array(EvolutionChainLinkSchema),
      species: NamedApiResourceSchema,
    })
);
export interface EvolutionChainLink {
  species: z.infer<typeof NamedApiResourceSchema>;
  evolves_to: EvolutionChainLink[];
}

export const EvolutionChainSchema = z
  .object({
    chain: EvolutionChainLinkSchema,
  })
  .passthrough();
export type EvolutionChain = z.infer<typeof EvolutionChainSchema>;

export const PokemonSpeciesSchema = z
  .object({
    evolution_chain: z.object({ url: z.string() }),
    flavor_text_entries: z.array(
      z.object({
        flavor_text: z.string(),
        language: NamedApiResourceSchema,
      })
    ),
    genera: z.array(
      z.object({
        genus: z.string(),
        language: NamedApiResourceSchema,
      })
    ),
    generation: NamedApiResourceSchema,
    id: z.number(),
    name: z.string(),
  })
  .passthrough();
export type PokemonSpecies = z.infer<typeof PokemonSpeciesSchema>;

export const BerryListResponseSchema = PokemonListResponseSchema;

export const BerrySchema = z
  .object({
    firmness: NamedApiResourceSchema,
    flavors: z.array(
      z.object({
        potency: z.number(),
        flavor: NamedApiResourceSchema,
      })
    ),
    growth_time: z.number(),
    id: z.number(),
    item: NamedApiResourceSchema,
    max_harvest: z.number(),
    name: z.string(),
    size: z.number(),
    smoothness: z.number(),
  })
  .passthrough();
export type Berry = z.infer<typeof BerrySchema>;
