import { Sprites } from "@pkmn/img";

import type { EvolutionStage } from "@/lib/types";

export type ShowdownSprite = {
  gen: number;
  w: number;
  h: number;
  url: string;
  pixelated?: boolean;
};

function toShowdownId(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function tryGetAnimatedSprite(name: string) {
  try {
    return Sprites.getPokemon(name, { gen: "gen5ani" });
  } catch {
    return null;
  }
}

function tryGetStaticSprite(name: string) {
  try {
    return Sprites.getPokemon(name, { gen: 5 });
  } catch {
    return null;
  }
}

function tryGetDexSprite(name: string) {
  try {
    return Sprites.getDexPokemon(name, { gen: "dex" });
  } catch {
    return null;
  }
}

export function getPokemonShowdownSprite(stage: EvolutionStage): ShowdownSprite | null {
  const id = toShowdownId(stage.name);
  return tryGetAnimatedSprite(id) ?? tryGetStaticSprite(id) ?? tryGetDexSprite(id);
}
