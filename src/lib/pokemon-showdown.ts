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

function isValidSpriteUrl(url: string | undefined) {
  return Boolean(url && !url.endsWith("/0.png") && !url.endsWith("/0.gif"));
}

function tryGetAnimatedSprite(name: string) {
  try {
    const sprite = Sprites.getPokemon(name, { gen: "gen5ani" });
    return isValidSpriteUrl(sprite?.url) ? sprite : null;
  } catch {
    return null;
  }
}

function tryGetStaticSprite(name: string) {
  try {
    const sprite = Sprites.getPokemon(name, { gen: 5 });
    return isValidSpriteUrl(sprite?.url) ? sprite : null;
  } catch {
    return null;
  }
}

function tryGetDexSprite(name: string) {
  try {
    const sprite = Sprites.getDexPokemon(name, { gen: "dex" });
    return isValidSpriteUrl(sprite?.url) ? sprite : null;
  } catch {
    return null;
  }
}

export function getPokemonShowdownSprite(stage: EvolutionStage): ShowdownSprite | null {
  const id = stage.showdownName ?? toShowdownId(stage.name);
  return tryGetAnimatedSprite(id) ?? tryGetStaticSprite(id) ?? tryGetDexSprite(id);
}

export function getPokemonShowdownDexSprite(stage: EvolutionStage): ShowdownSprite | null {
  const id = stage.showdownName ?? toShowdownId(stage.name);
  return tryGetDexSprite(id) ?? tryGetStaticSprite(id) ?? tryGetAnimatedSprite(id);
}
