"use client";

import { gsap } from "gsap";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { getEvolutionStage } from "@/lib/constants";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import type { OverlayEvent } from "@/lib/types";

import { PokemonBattleSprite } from "./pokemon-battle-sprite";

type EvolutionOverlayProps = {
  overlay: OverlayEvent;
  audioEnabled: boolean;
  onComplete: () => void;
};

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

export function EvolutionOverlay({ overlay, audioEnabled, onComplete }: EvolutionOverlayProps) {
  const fromStage = getEvolutionStage(overlay.mascot, overlay.fromLevel);
  const toStage = getEvolutionStage(overlay.mascot, overlay.toLevel);
  const rootRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const teamChipRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const nameFlowRef = useRef<HTMLDivElement>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);
  const pillarRef = useRef<HTMLDivElement>(null);
  const outerRingRef = useRef<HTMLDivElement>(null);
  const innerRingRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const {
    playEvolutionCharge,
    playEvolutionFlash,
    playEvolutionReveal,
    stopEvolutionAudio,
  } = useSoundEffects(audioEnabled);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([teamChipRef.current, titleRef.current, subtitleRef.current, nameFlowRef.current], {
        opacity: 0,
        y: 16,
      });
      gsap.set([pillarRef.current, outerRingRef.current, innerRingRef.current, coreRef.current], {
        opacity: 0.18,
        scale: 0.86,
      });
      gsap.set(silhouetteRef.current, {
        opacity: 0,
        scale: 0.5,
        filter: "brightness(0) saturate(0) contrast(1.4)",
      });
      gsap.set(toRef.current, {
        opacity: 0,
        scale: 0.36,
        y: 28,
        filter: "brightness(3) blur(18px)",
      });
      gsap.set(statusRef.current, {
        opacity: 0,
        y: 18,
      });
      gsap.set(flashRef.current, { opacity: 0 });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
        onComplete,
      });

      timeline
        .add(() => {
          stopEvolutionAudio();
          playEvolutionCharge();
        }, 0)
        .to(teamChipRef.current, { opacity: 1, y: 0, duration: 0.26 }, 0.02)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.36 }, 0.12)
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.32 }, 0.22)
        .to(nameFlowRef.current, { opacity: 1, y: 0, duration: 0.32 }, 0.28)
        .to(
          [pillarRef.current, outerRingRef.current, innerRingRef.current, coreRef.current],
          {
            opacity: 0.92,
            scale: 1,
            duration: 0.6,
            stagger: 0.04,
            ease: "sine.out",
          },
          0.34,
        )
        .to(
          battlefieldRef.current,
          {
            keyframes: [
              { x: -10, rotation: -0.5, duration: 0.07 },
              { x: 12, rotation: 0.5, duration: 0.08 },
              { x: -10, rotation: -0.4, duration: 0.08 },
              { x: 10, rotation: 0.35, duration: 0.08 },
              { x: -6, rotation: -0.2, duration: 0.08 },
              { x: 0, rotation: 0, duration: 0.1 },
            ],
            ease: "sine.inOut",
          },
          0.9,
        )
        .to(
          fromRef.current,
          {
            keyframes: [
              { scale: 1.05, x: -12, y: -6, filter: "brightness(1.2)", duration: 0.18 },
              { scale: 0.98, x: 12, y: 4, filter: "brightness(1.45) blur(2px)", duration: 0.18 },
              { scale: 0.88, x: -10, y: -2, filter: "brightness(2.1) blur(5px)", duration: 0.22 },
              { scale: 0.72, x: 0, y: 16, filter: "brightness(3) blur(14px)", opacity: 0, duration: 0.34 },
            ],
          },
          0.78,
        )
        .to(
          silhouetteRef.current,
          {
            keyframes: [
              { opacity: 0.3, scale: 0.72, x: -8, duration: 0.16 },
              { opacity: 1, scale: 1.02, x: 8, duration: 0.22 },
              { opacity: 0.28, scale: 0.94, x: -6, duration: 0.16 },
              { opacity: 1, scale: 1.12, x: 6, duration: 0.22 },
              { opacity: 0, scale: 1.18, x: 0, duration: 0.2 },
            ],
            ease: "power1.inOut",
          },
          1.28,
        )
        .add(() => {
          playEvolutionFlash();
        }, 1.78)
        .to(
          flashRef.current,
          {
            keyframes: [
              { opacity: 0.96, duration: 0.08 },
              { opacity: 0.06, duration: 0.08 },
              { opacity: 1, duration: 0.08 },
              { opacity: 0.12, duration: 0.09 },
              { opacity: 0.88, duration: 0.07 },
              { opacity: 0, duration: 0.12 },
            ],
            ease: "power4.out",
          },
          1.76,
        )
        .add(() => {
          playEvolutionReveal();
        }, 2.04)
        .to(
          toRef.current,
          {
            keyframes: [
              { opacity: 0.2, scale: 0.66, y: 16, filter: "brightness(2.2) blur(10px)", duration: 0.16 },
              { opacity: 1, scale: 1.16, y: -10, filter: "brightness(1.3) blur(1px)", duration: 0.34, ease: "back.out(1.9)" },
              { opacity: 1, scale: 1, y: 0, filter: "brightness(1) blur(0px)", duration: 0.24 },
            ],
          },
          1.96,
        )
        .to(statusRef.current, { opacity: 1, y: 0, duration: 0.32 }, 2.42)
        .to(rootRef.current, { opacity: 0, duration: 0.35 }, 3.9);
    }, rootRef);

    return () => {
      stopEvolutionAudio();
      ctx.revert();
    };
  }, [audioEnabled, onComplete, playEvolutionCharge, playEvolutionFlash, playEvolutionReveal, stopEvolutionAudio]);

  return (
    <motion.div
      key={overlay.id}
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="evolution-screen fixed inset-0 z-50 overflow-hidden"
      style={{
        background: `radial-gradient(circle at center, rgba(255,255,255,0.96) 0%, ${overlay.accentColor}40 24%, rgba(11,18,32,0.86) 100%)`,
      }}
    >
      <div ref={flashRef} className="absolute inset-0 evolution-screen__flash" />
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
        <div ref={teamChipRef} className="evolution-screen__team-chip">{overlay.teamName}</div>
        <h2 ref={titleRef} className="mt-5 font-heading text-5xl sm:text-7xl">Ô? {fromStage.name} đang tiến hóa!</h2>
        <p ref={subtitleRef} className="mt-3 max-w-3xl text-lg text-white/80 sm:text-2xl">
          Hãy chờ một chút để {overlay.teamName} mở ra dạng mới.
        </p>
        <div ref={nameFlowRef} className="evolution-screen__name-flow mt-5">
          <span>{fromStage.name}</span>
          <span className="evolution-screen__name-arrow">→</span>
          <span>{toStage.name}</span>
        </div>

        <div ref={battlefieldRef} className="evolution-screen__battlefield relative mt-10 flex items-center justify-center">
          <div ref={pillarRef} className="evolution-screen__pillar" />
          <div ref={outerRingRef} className="evolution-screen__burst-ring evolution-screen__burst-ring--outer" />
          <div ref={innerRingRef} className="evolution-screen__burst-ring evolution-screen__burst-ring--inner" />
          <motion.div
            className="evolution-screen__orbit"
            animate={{ rotate: 360 }}
            transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <div ref={coreRef} className="evolution-screen__energy-core" />

          <div className="evolution-screen__sprite-anchor">
            <div
              ref={fromRef}
              className="evolution-screen__sprite evolution-screen__sprite--from"
            >
              <PokemonBattleSprite stage={fromStage} maxWidth={250} />
            </div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <div
              ref={silhouetteRef}
              className="evolution-screen__sprite evolution-screen__sprite--silhouette"
            >
              <PokemonBattleSprite stage={toStage} maxWidth={304} silhouette />
            </div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <div
              ref={toRef}
              className="evolution-screen__sprite evolution-screen__sprite--to"
            >
              <PokemonBattleSprite stage={toStage} maxWidth={304} />
            </div>
          </div>
        </div>

        <div
          ref={statusRef}
          className="evolution-screen__status-pill mt-8"
        >
          {fromStage.name} đã tiến hóa thành {toStage.name}!
        </div>
      </div>
    </motion.div>
  );
}
