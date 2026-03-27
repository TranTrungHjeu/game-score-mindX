"use client";

import Image from "next/image";

import { getEvolutionStage } from "@/lib/constants";
import { getPokemonShowdownDexSprite, getPokemonShowdownSprite } from "@/lib/pokemon-showdown";
import type { EvolutionStage, MascotFamily } from "@/lib/types";
import { cn } from "@/lib/utils";

type MascotAvatarProps = {
  family: MascotFamily;
  level: number;
  stage?: EvolutionStage;
  size?: number;
  className?: string;
  glow?: boolean;
  animate?: boolean;
};

const LEVEL_SCALE = [0.78, 0.86, 1];
const FRAME_SCALE = 1.14;
const SPRITE_COVERAGE = 1.2;

export function MascotAvatar({
  family,
  level,
  stage: providedStage,
  size = 200,
  className,
  glow = false,
  animate = true,
}: MascotAvatarProps) {
  const stage = providedStage ?? getEvolutionStage(family, level);
  const safeLevel = Math.max(1, Math.min(level, Math.min(LEVEL_SCALE.length, family.evolutionChain.length)));
  const scale = LEVEL_SCALE[safeLevel - 1] ?? 1;
  const showdownSprite = animate ? getPokemonShowdownSprite(stage) : getPokemonShowdownDexSprite(stage);
  const imageSrc = showdownSprite?.url ?? (animate ? stage.animatedPath : stage.artworkPath);
  const frameSize = Math.round(size * FRAME_SCALE);
  const spriteSize = Math.round(size * SPRITE_COVERAGE);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-visible rounded-full",
        className,
      )}
      style={{ width: frameSize, height: frameSize }}
      aria-label={`${stage.name} stage ${safeLevel}`}
    >
      <div className="absolute inset-0 rounded-full border-[4px] border-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_12px_28px_rgba(15,23,42,0.16)]" />
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className={cn(
            "absolute inset-[3%] rounded-full blur-3xl transition-opacity duration-500",
            glow ? "opacity-100" : "opacity-65",
          )}
          style={{ background: `radial-gradient(circle, ${family.accent}66 0%, transparent 72%)` }}
        />
        <div
          className="absolute inset-0 rounded-full border-[4px] border-white/42"
          style={{
            background: `radial-gradient(circle at 32% 26%, ${family.secondary}ee 0%, ${family.accent}44 62%, transparent 82%)`,
          }}
        />
        <div className="absolute inset-[5%] rounded-full border-[4px] border-white/40 bg-slate-950/18 backdrop-blur-sm" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_36%)]" />
      </div>

      <div
        className="absolute left-1/2 top-1/2 z-20 flex items-center justify-center"
        style={{
          width: spriteSize,
          height: spriteSize,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div className={cn("relative h-full w-full", animate && "pokemon-avatar__float")}>
          <Image
            src={imageSrc}
            alt={stage.name}
            fill
            sizes={`${spriteSize}px`}
            priority={size >= 200}
            draggable={false}
            unoptimized
            className={cn(
              "object-contain object-center drop-shadow-[0_18px_30px_rgba(15,23,42,0.35)] select-none",
              glow && "drop-shadow-[0_22px_40px_rgba(255,255,255,0.22)]",
            )}
          />
        </div>
      </div>
    </div>
  );
}
