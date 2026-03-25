"use client";

import Image from "next/image";

import { getEvolutionStage } from "@/lib/constants";
import type { MascotFamily } from "@/lib/types";
import { cn } from "@/lib/utils";

type MascotAvatarProps = {
  family: MascotFamily;
  level: number;
  size?: number;
  className?: string;
  glow?: boolean;
  animate?: boolean;
};

const LEVEL_SCALE = [0.9, 1, 1.12];

export function MascotAvatar({
  family,
  level,
  size = 200,
  className,
  glow = false,
  animate = true,
}: MascotAvatarProps) {
  const stage = getEvolutionStage(family, level);
  const safeLevel = Math.max(1, Math.min(level, Math.min(LEVEL_SCALE.length, family.evolutionChain.length)));
  const scale = LEVEL_SCALE[safeLevel - 1] ?? 1;
  const imageSrc = animate ? stage.animatedPath : stage.artworkPath;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
      aria-label={`${stage.name} stage ${safeLevel}`}
    >
      <div
        className={cn(
          "absolute inset-[8%] rounded-full blur-2xl transition-opacity duration-500",
          glow ? "opacity-100" : "opacity-65",
        )}
        style={{ background: `radial-gradient(circle, ${family.accent}66 0%, transparent 72%)` }}
      />
      <div
        className="absolute inset-0 rounded-full border border-white/15"
        style={{
          background: `radial-gradient(circle at 32% 26%, ${family.secondary}ee 0%, ${family.accent}44 62%, transparent 82%)`,
        }}
      />
      <div className="absolute inset-[7%] rounded-full border border-white/18 bg-slate-950/12 backdrop-blur-sm" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_36%)]" />

      <div className="absolute inset-[14%]" style={{ transform: `scale(${scale})` }}>
        <div className={cn("relative h-full w-full", animate && "pokemon-avatar__float")}>
          {/* Animated sprite comes from the PokeAPI sprite set; static artwork stays for calmer contexts. */}
          <Image
            src={imageSrc}
            alt={stage.name}
            fill
            sizes={`${size}px`}
            priority={size >= 200}
            draggable={false}
            unoptimized={animate}
            className={cn(
              "object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.35)] select-none",
              glow && "drop-shadow-[0_22px_40px_rgba(255,255,255,0.22)]",
            )}
          />
        </div>
      </div>
    </div>
  );
}
