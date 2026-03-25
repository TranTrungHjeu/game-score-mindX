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

const EVOLUTION_DURATION_MS = 4200;

const SPARKS = [
  { top: "14%", left: "18%", size: 12, delay: 0, hue: "cool" },
  { top: "20%", left: "78%", size: 10, delay: 0.18, hue: "warm" },
  { top: "34%", left: "12%", size: 8, delay: 0.32, hue: "cool" },
  { top: "40%", left: "88%", size: 12, delay: 0.46, hue: "warm" },
  { top: "62%", left: "18%", size: 14, delay: 0.6, hue: "warm" },
  { top: "74%", left: "26%", size: 10, delay: 0.76, hue: "cool" },
  { top: "70%", left: "78%", size: 16, delay: 0.92, hue: "cool" },
  { top: "54%", left: "84%", size: 10, delay: 1.08, hue: "warm" },
] as const;

export function EvolutionOverlay({ overlay, onComplete }: EvolutionOverlayProps) {
  const fromStage = getEvolutionStage(overlay.mascot, overlay.fromLevel);
  const toStage = getEvolutionStage(overlay.mascot, overlay.toLevel);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onComplete();
    }, EVOLUTION_DURATION_MS);

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
          className={`evolution-screen__spark evolution-screen__spark--${spark.hue}`}
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
          }}
          animate={{
            opacity: [0, 0.95, 0],
            scale: [0.35, 1.35, 0.55],
            rotate: [0, 90, 180],
            y: [12, -8, -26],
          }}
          transition={{
            duration: 1.4,
            repeat: Number.POSITIVE_INFINITY,
            delay: spark.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <div className="evolution-screen__team-chip">{overlay.teamName}</div>
        <h2 className="mt-5 font-heading text-5xl sm:text-7xl">Ô? {fromStage.name} đang tiến hóa!</h2>
        <p className="mt-3 max-w-3xl text-lg text-white/80 sm:text-2xl">
          Hãy chờ một chút để {overlay.teamName} mở ra dạng mới.
        </p>
        <div className="evolution-screen__name-flow mt-5">
          <span>{fromStage.name}</span>
          <span className="evolution-screen__name-arrow">→</span>
          <span>{toStage.name}</span>
        </div>

        <div className="evolution-screen__battlefield relative mt-10 flex items-center justify-center">
          <div className="evolution-screen__pillar" />
          <motion.div
            className="evolution-screen__burst-ring evolution-screen__burst-ring--outer"
            animate={{
              opacity: [0.12, 0.46, 0.1],
              scale: [0.84, 1.18, 1.3],
            }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="evolution-screen__burst-ring evolution-screen__burst-ring--inner"
            animate={{
              opacity: [0.2, 0.68, 0.12],
              scale: [0.62, 0.94, 1.05],
            }}
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.16 }}
          />
          <motion.div
            className="evolution-screen__orbit"
            animate={{ rotate: 360 }}
            transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.div
            className="evolution-screen__energy-core"
            animate={{
              opacity: [0.3, 0.92, 0.36],
              scale: [0.76, 1.14, 0.9],
            }}
            transition={{ duration: 1.05, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <div className="evolution-screen__sprite-anchor">
            <motion.div
              className="evolution-screen__sprite evolution-screen__sprite--from"
              animate={{
                opacity: [1, 1, 0.5, 0.08, 0],
                scale: [1, 1.04, 0.94, 0.8, 0.68],
                x: [0, -14, 12, -12, 10, 0],
                y: [0, -8, 6, -4, 10, 18],
                filter: [
                  "brightness(1)",
                  "brightness(1.2)",
                  "brightness(1.8) blur(3px)",
                  "brightness(2.5) blur(8px)",
                  "brightness(3) blur(14px)",
                ],
              }}
              transition={{ duration: 1.7, ease: "easeInOut", times: [0, 0.18, 0.42, 0.72, 1] }}
            >
              <PokemonBattleSprite stage={fromStage} maxWidth={250} />
            </motion.div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <motion.div
              className="evolution-screen__sprite evolution-screen__sprite--silhouette"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: [0, 0.24, 0.95, 0.26, 0.98, 0],
                scale: [0.46, 0.8, 1.02, 0.98, 1.12, 1.16],
                x: [0, -8, 8, -6, 6, 0],
              }}
              transition={{
                duration: 1.55,
                delay: 0.9,
                ease: "easeInOut",
                times: [0, 0.18, 0.38, 0.58, 0.82, 1],
              }}
            >
              <PokemonBattleSprite stage={toStage} maxWidth={304} silhouette />
            </motion.div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <motion.div
              className="evolution-screen__sprite evolution-screen__sprite--to"
              initial={{ opacity: 0, scale: 0.48 }}
              animate={{
                opacity: [0, 0, 0.2, 1, 1],
                scale: [0.42, 0.42, 0.76, 1.16, 1],
                y: [30, 30, 18, -10, 0],
                filter: [
                  "brightness(3.2) blur(20px)",
                  "brightness(3.2) blur(20px)",
                  "brightness(2) blur(10px)",
                  "brightness(1.3) blur(1px)",
                  "brightness(1) blur(0)",
                ],
              }}
              transition={{
                duration: 1.7,
                delay: 1.72,
                ease: "easeOut",
                times: [0, 0.2, 0.42, 0.72, 1],
              }}
            >
              <PokemonBattleSprite stage={toStage} maxWidth={304} />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: [0, 0, 1, 1], y: [16, 16, 0, 0] }}
          transition={{ duration: 1.6, delay: 2.45, times: [0, 0.32, 0.7, 1], ease: "easeOut" }}
          className="evolution-screen__status-pill mt-8"
        >
          {fromStage.name} đã tiến hóa thành {toStage.name}!
        </motion.div>
      </div>
    </motion.div>
  );
}
