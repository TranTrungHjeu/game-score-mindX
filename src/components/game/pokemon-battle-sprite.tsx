"use client";

import Image from "next/image";

import { getPokemonShowdownSprite } from "@/lib/pokemon-showdown";
import type { EvolutionStage } from "@/lib/types";
import { cn } from "@/lib/utils";

type PokemonBattleSpriteProps = {
  stage: EvolutionStage;
  maxWidth: number;
  className?: string;
  silhouette?: boolean;
};

export function PokemonBattleSprite({
  stage,
  maxWidth,
  className,
  silhouette = false,
}: PokemonBattleSpriteProps) {
  const sprite = getPokemonShowdownSprite(stage);
  const width = sprite?.w ?? 96;
  const height = sprite?.h ?? 96;
  const imageSrc = sprite?.url ?? stage.animatedPath;

  return (
    <Image
      src={imageSrc}
      alt={stage.name}
      width={width}
      height={height}
      draggable={false}
      priority
      unoptimized
      className={cn(
        "pointer-events-none select-none object-contain",
        sprite?.pixelated && "pokemon-battle-sprite--pixel",
        silhouette && "pokemon-battle-sprite--silhouette",
        className,
      )}
      style={{
        width: `${maxWidth}px`,
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
}
