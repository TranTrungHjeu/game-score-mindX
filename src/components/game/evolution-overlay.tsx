"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

import { getEvolutionStage } from "@/lib/constants";
import type { OverlayEvent } from "@/lib/types";

import { PokemonBattleSprite } from "./pokemon-battle-sprite";

type EvolutionOverlayProps = {
  overlay: OverlayEvent;
  onComplete: () => void;
};

const SPARKS = [
  { top: "16%", left: "24%", size: 14, delay: 0 },
  { top: "26%", left: "76%", size: 10, delay: 0.22 },
  { top: "66%", left: "21%", size: 12, delay: 0.38 },
  { top: "74%", left: "80%", size: 16, delay: 0.54 },
  { top: "46%", left: "14%", size: 8, delay: 0.7 },
  { top: "42%", left: "87%", size: 12, delay: 0.86 },
] as const;

export function EvolutionOverlay({ overlay, onComplete }: EvolutionOverlayProps) {
  const fromStage = getEvolutionStage(overlay.mascot, overlay.fromLevel);
  const toStage = getEvolutionStage(overlay.mascot, overlay.toLevel);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onComplete();
    }, 3400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      key={overlay.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="evolution-screen fixed inset-0 z-50 overflow-hidden"
      style={{
        background: `radial-gradient(circle at center, rgba(255,255,255,0.96) 0%, ${overlay.accentColor}40 24%, rgba(11,18,32,0.86) 100%)`,
      }}
    >
      <div className="absolute inset-0 evolution-screen__flash" />
      <div className="absolute inset-0 evolution-screen__scanlines" />
      <div className="absolute inset-0 evolution-screen__stars" />
      {SPARKS.map((spark, index) => (
        <motion.span
          key={`${overlay.id}-spark-${index}`}
          className="evolution-screen__spark"
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.3, 1.25, 0.6],
            rotate: [0, 45, 90],
          }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: spark.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <div className="kid-chip mb-4 text-sm font-bold text-cyan-700">Tiến hóa!</div>
        <h2 className="font-heading text-5xl sm:text-7xl">{overlay.teamName}</h2>
        <p className="mt-3 max-w-3xl text-lg text-white/78 sm:text-2xl">
          {fromStage.name} đang biến đổi để trở thành {toStage.name}
        </p>

        <div className="evolution-screen__battlefield relative mt-10 flex items-center justify-center">
          <motion.div
            className="evolution-screen__orbit"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.div
            className="evolution-screen__energy-core"
            animate={{
              opacity: [0.35, 0.95, 0.4],
              scale: [0.84, 1.12, 0.92],
            }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <div className="evolution-screen__sprite-anchor">
            <motion.div
              className="evolution-screen__sprite evolution-screen__sprite--from"
              animate={{
                opacity: [1, 1, 0.15, 0],
                scale: [1, 1.08, 0.88, 0.72],
                y: [0, -10, 8, 16],
                filter: [
                  "brightness(1)",
                  "brightness(1.15)",
                  "brightness(2.2) blur(4px)",
                  "brightness(2.8) blur(12px)",
                ],
              }}
              transition={{ duration: 1.4, ease: "easeInOut", times: [0, 0.3, 0.72, 1] }}
            >
              <PokemonBattleSprite stage={fromStage} maxWidth={240} />
            </motion.div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <motion.div
              className="evolution-screen__sprite evolution-screen__sprite--silhouette"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: [0, 0.95, 0.2, 0.9, 0],
                scale: [0.6, 1.04, 0.98, 1.08, 1.12],
              }}
              transition={{
                duration: 1.15,
                delay: 0.92,
                ease: "easeInOut",
                times: [0, 0.26, 0.52, 0.76, 1],
              }}
            >
              <PokemonBattleSprite stage={toStage} maxWidth={292} silhouette />
            </motion.div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <motion.div
              className="evolution-screen__sprite evolution-screen__sprite--to"
              initial={{ opacity: 0, scale: 0.48 }}
              animate={{
                opacity: [0, 0, 1, 1],
                scale: [0.48, 0.48, 1.14, 1],
                y: [24, 24, -12, 0],
                filter: [
                  "brightness(2.8) blur(18px)",
                  "brightness(2.8) blur(18px)",
                  "brightness(1.25) blur(1px)",
                  "brightness(1) blur(0)",
                ],
              }}
              transition={{
                duration: 1.35,
                delay: 1.28,
                ease: "easeOut",
                times: [0, 0.24, 0.62, 1],
              }}
            >
              <PokemonBattleSprite stage={toStage} maxWidth={292} />
            </motion.div>
          </div>
        </div>

        <div className="mt-8 rounded-full border-2 border-white/20 bg-white/12 px-6 py-3 text-sm font-black text-cyan-100 shadow-[0_24px_60px_rgba(15,23,42,0.32)] backdrop-blur-md">
          {fromStage.name} đã tiến hóa thành {toStage.name}
        </div>
      </div>
    </motion.div>
  );
}
