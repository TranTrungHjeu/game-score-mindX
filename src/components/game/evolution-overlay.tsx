"use client";

import { gsap } from "gsap";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useSoundEffects } from "@/hooks/use-sound-effects";
import type { OverlayEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

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

const SHARDS = Array.from({ length: 8 }, (_, index) => index);

export function EvolutionOverlay({ overlay, audioEnabled, onComplete }: EvolutionOverlayProps) {
  const isMega = overlay.kind === "mega";
  const isDevolution = overlay.kind === "devolution";
  const megaLeadIn = isMega ? 0.96 : 0;
  const [megaVideoError, setMegaVideoError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const nameFlowRef = useRef<HTMLDivElement>(null);
  const megaPreludeRef = useRef<HTMLDivElement>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);
  const pillarRef = useRef<HTMLDivElement>(null);
  const outerRingRef = useRef<HTMLDivElement>(null);
  const innerRingRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const shardRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const { playEvolutionWhoosh, playMegaEvolution, playDevolutionSadTone, stopEvolutionAudio } = useSoundEffects(audioEnabled);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTargets = [titleRef.current, subtitleRef.current, nameFlowRef.current].filter(
        (element): element is HTMLHeadingElement | HTMLParagraphElement | HTMLDivElement => element !== null,
      );

      gsap.set(introTargets, {
        opacity: 0,
        y: 16,
      });
      gsap.set([pillarRef.current, outerRingRef.current, innerRingRef.current, coreRef.current], {
        opacity: isDevolution ? 0.08 : 0.2,
        scale: isMega ? 0.74 : 0.86,
      });
      gsap.set(silhouetteRef.current, {
        opacity: 0,
        scale: isDevolution ? 0.9 : 0.5,
        filter: isDevolution ? "brightness(0) saturate(0) blur(1px)" : "brightness(0) saturate(0) contrast(1.4)",
      });
      gsap.set(toRef.current, {
        opacity: 0,
        scale: isDevolution ? 0.72 : 0.36,
        y: isDevolution ? 34 : 28,
        filter: isDevolution ? "brightness(0.5) saturate(0) blur(10px)" : "brightness(3) blur(18px)",
      });
      gsap.set(flashRef.current, { opacity: 0 });
      gsap.set(megaPreludeRef.current, {
        opacity: 0,
        scale: 1.06,
      });
      gsap.set(shardRefs.current, {
        opacity: 0,
        scale: 0.5,
      });
      const shardTargets = shardRefs.current.filter((element): element is HTMLSpanElement => Boolean(element));
      const shardVars = {
        stagger: 0.03,
        ease: "power2.out",
        keyframes: [
          { opacity: 0, scale: 0.4, duration: 0.01 },
          {
            opacity: 0.84,
            scale: 1,
            x: () => (Math.random() - 0.5) * 140,
            y: () => 30 + Math.random() * 36,
            rotation: () => -120 + Math.random() * 240,
            duration: 0.24,
          },
          {
            opacity: 0,
            scale: 0.72,
            x: () => (Math.random() - 0.5) * 220,
            y: () => 80 + Math.random() * 110,
            rotation: () => -160 + Math.random() * 320,
            duration: 0.65,
          },
        ],
      } as gsap.TweenVars;

      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
        onComplete,
      });

      timeline
        .add(() => {
          stopEvolutionAudio();

          if (isMega) {
            playMegaEvolution();
            return;
          }

          if (isDevolution) {
            playDevolutionSadTone();
            return;
          }

          playEvolutionWhoosh();
        }, 0)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.34 }, megaLeadIn + 0.08)
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.3 }, megaLeadIn + 0.18)
        .to(nameFlowRef.current, { opacity: 1, y: 0, duration: 0.3 }, megaLeadIn + 0.24)
        .to(
          megaPreludeRef.current,
          {
            opacity: isMega ? 1 : 0,
            scale: 1,
            duration: isMega ? 0.24 : 0.44,
            ease: "power2.out",
          },
          isMega ? 0 : 0.02,
        )
        .to(
          [pillarRef.current, outerRingRef.current, innerRingRef.current, coreRef.current],
          {
            opacity: isDevolution ? 0.42 : 0.96,
            scale: 1,
            duration: isMega ? 0.76 : 0.58,
            stagger: 0.04,
            ease: "sine.out",
          },
          megaLeadIn + 0.26,
        )
        .to(
          battlefieldRef.current,
          {
            keyframes: isDevolution
              ? [
                  { x: -6, rotation: -0.3, duration: 0.08 },
                  { x: 4, rotation: 0.2, duration: 0.08 },
                  { x: -4, rotation: -0.16, duration: 0.08 },
                  { x: 0, rotation: 0, duration: 0.1 },
                ]
              : [
                  { x: -10, rotation: -0.5, duration: 0.07 },
                  { x: 12, rotation: 0.5, duration: 0.08 },
                  { x: -10, rotation: -0.4, duration: 0.08 },
                  { x: 10, rotation: 0.35, duration: 0.08 },
                  { x: -6, rotation: -0.2, duration: 0.08 },
                  { x: 0, rotation: 0, duration: 0.1 },
                ],
            ease: "sine.inOut",
          },
          megaLeadIn + 0.86,
        );

      if (isDevolution) {
        timeline
          .to(
            fromRef.current,
            {
              keyframes: [
                { scale: 1.06, y: -10, filter: "brightness(0.9) saturate(0.7)", duration: 0.18 },
                { scale: 0.92, y: 6, filter: "brightness(0.6) saturate(0.2) blur(2px)", duration: 0.18 },
                { scale: 0.78, y: 18, filter: "brightness(0.35) saturate(0) blur(8px)", opacity: 0.18, duration: 0.22 },
              ],
            },
            0.82,
          )
          .to(
            shardTargets,
            shardVars,
            1.02,
          )
          .to(
            silhouetteRef.current,
            {
              opacity: 0.45,
              scale: 0.98,
              duration: 0.24,
              ease: "power2.out",
            },
            1.18,
          )
          .to(
            flashRef.current,
            {
              keyframes: [
                { opacity: 0.22, duration: 0.12 },
                { opacity: 0.04, duration: 0.1 },
                { opacity: 0.14, duration: 0.1 },
                { opacity: 0, duration: 0.12 },
              ],
            },
            1.24,
          )
          .to(
            toRef.current,
            {
              keyframes: [
                { opacity: 0.5, scale: 0.82, y: 22, filter: "brightness(0.7) saturate(0.1) blur(8px)", duration: 0.18 },
                { opacity: 1, scale: 1.02, y: 0, filter: "brightness(1) blur(0px)", duration: 0.28 },
                { opacity: 1, scale: 1, y: 0, duration: 0.18 },
              ],
            },
            1.36,
          )
          .to(rootRef.current, { opacity: 0, duration: 0.34 }, 3.16);
      } else {
        timeline
          .to(
            megaPreludeRef.current,
            {
              opacity: isMega ? 0 : 0,
              duration: isMega ? 0.28 : 0.34,
              ease: "power1.out",
            },
            isMega ? megaLeadIn - 0.12 : 0,
          )
          .to(
            fromRef.current,
            {
              keyframes: [
                { scale: isMega ? 1.1 : 1.05, x: -12, y: -6, filter: "brightness(1.2)", duration: 0.18 },
                { scale: 0.98, x: 12, y: 4, filter: "brightness(1.45) blur(2px)", duration: 0.18 },
                { scale: isMega ? 0.94 : 0.88, x: -10, y: -2, filter: "brightness(2.1) blur(5px)", duration: 0.22 },
                { scale: isMega ? 0.68 : 0.72, x: 0, y: 16, filter: "brightness(3) blur(14px)", opacity: 0, duration: 0.34 },
              ],
            },
            megaLeadIn + 0.78,
          )
          .to(
            silhouetteRef.current,
            {
              keyframes: [
                { opacity: 0.3, scale: 0.72, x: -8, duration: 0.16 },
                { opacity: 1, scale: isMega ? 1.14 : 1.02, x: 8, duration: 0.22 },
                { opacity: 0.28, scale: 0.94, x: -6, duration: 0.16 },
                { opacity: 1, scale: isMega ? 1.22 : 1.12, x: 6, duration: 0.22 },
                { opacity: 0, scale: isMega ? 1.28 : 1.18, x: 0, duration: 0.2 },
              ],
              ease: "power1.inOut",
            },
            megaLeadIn + 1.2,
          )
          .to(
            flashRef.current,
            {
              keyframes: isMega
                ? [
                    { opacity: 1, duration: 0.08 },
                    { opacity: 0.14, duration: 0.06 },
                    { opacity: 0.92, duration: 0.08 },
                    { opacity: 0, duration: 0.14 },
                  ]
                : [
                    { opacity: 0.96, duration: 0.08 },
                    { opacity: 0.06, duration: 0.08 },
                    { opacity: 1, duration: 0.08 },
                    { opacity: 0.12, duration: 0.09 },
                    { opacity: 0.88, duration: 0.07 },
                    { opacity: 0, duration: 0.12 },
                  ],
            },
            megaLeadIn + (isMega ? 1.7 : 1.76),
          )
          .to(
            toRef.current,
            {
              keyframes: [
                { opacity: 0.2, scale: isMega ? 0.84 : 0.66, y: 16, filter: "brightness(2.2) blur(10px)", duration: 0.16 },
                { opacity: 1, scale: isMega ? 1.22 : 1.16, y: -10, filter: "brightness(1.3) blur(1px)", duration: 0.34, ease: "back.out(1.9)" },
                { opacity: 1, scale: 1, y: 0, filter: "brightness(1) blur(0px)", duration: 0.24 },
              ],
            },
            megaLeadIn + (isMega ? 1.86 : 1.96),
          )
          .to(rootRef.current, { opacity: 0, duration: 0.35 }, megaLeadIn + (isMega ? 3.68 : 3.9));
      }
    }, rootRef);

    return () => {
      stopEvolutionAudio();
      ctx.revert();
    };
  }, [audioEnabled, isDevolution, isMega, megaLeadIn, onComplete, playDevolutionSadTone, playEvolutionWhoosh, playMegaEvolution, stopEvolutionAudio]);

  const title = isMega
    ? "Mega Evolution!"
    : isDevolution
      ? `${overlay.fromStage.name} đang xuống dạng...`
      : `Ô? ${overlay.fromStage.name} đang tiến hóa!`;
  const subtitle = isMega
    ? `${overlay.teamName} đã giành được Đá Mega và sẵn sàng bùng nổ sức mạnh mới.`
    : isDevolution
      ? `${overlay.teamName} vừa bị trừ điểm nên Pokémon phải lùi lại một dạng.`
      : `Hãy chờ một chút để ${overlay.teamName} mở ra dạng mới.`;
  return (
    <motion.div
      key={overlay.id}
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "evolution-screen fixed inset-0 z-50 overflow-hidden",
        isMega && "evolution-screen--mega",
        isDevolution && "evolution-screen--devolution",
      )}
      style={{
        background: isDevolution
          ? `radial-gradient(circle at center, rgba(255,255,255,0.14) 0%, rgba(116,147,184,0.22) 18%, rgba(9,15,28,0.94) 100%)`
          : isMega
            ? `radial-gradient(circle at center, rgba(255,255,255,0.94) 0%, ${overlay.accentColor}52 22%, rgba(28,10,52,0.94) 100%)`
            : `radial-gradient(circle at center, rgba(255,255,255,0.96) 0%, ${overlay.accentColor}40 24%, rgba(11,18,32,0.86) 100%)`,
      }}
    >
      {isMega ? (
        <div ref={megaPreludeRef} className="evolution-screen__mega-prelude">
          <div className="evolution-screen__mega-prelude-fallback" />
          {!megaVideoError ? (
            <video
              className="evolution-screen__mega-prelude-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setMegaVideoError(true)}
            >
              <source src="/assets/mega.webm" type="video/webm" />
            </video>
          ) : null}
        </div>
      ) : null}
      <div ref={flashRef} className="absolute inset-0 evolution-screen__flash" />
      <div className="absolute inset-0 evolution-screen__scanlines" />
      <div className="absolute inset-0 evolution-screen__stars" />
      {SPARKS.map((spark, index) => (
        <motion.span
          key={`${overlay.id}-spark-${index}`}
          className={cn(
            `evolution-screen__spark evolution-screen__spark--${spark.hue}`,
            isDevolution && "evolution-screen__spark--sad",
            isMega && "evolution-screen__spark--mega",
          )}
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
          }}
          animate={{
            opacity: [0, isDevolution ? 0.6 : 0.95, 0],
            scale: [0.35, isMega ? 1.55 : 1.35, 0.55],
            rotate: [0, 90, 180],
            y: [12, -8, isDevolution ? 18 : -26],
          }}
          transition={{
            duration: isDevolution ? 1.8 : 1.4,
            repeat: Number.POSITIVE_INFINITY,
            delay: spark.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      {isDevolution
        ? SHARDS.map((shard) => (
            <span
              key={`${overlay.id}-shard-${shard}`}
              ref={(element) => {
                shardRefs.current[shard] = element;
              }}
              className="evolution-screen__shard"
            />
          ))
        : null}

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <h2 ref={titleRef} className="relative z-30 font-heading text-4xl sm:text-6xl">
          {title}
        </h2>
        <p ref={subtitleRef} className="relative z-30 mt-3 max-w-3xl text-lg text-white/80 sm:text-2xl">
          {subtitle}
        </p>
        <div ref={nameFlowRef} className="evolution-screen__name-flow relative z-30 mt-5">
          <span>{overlay.fromStage.name}</span>
          <span className="evolution-screen__name-arrow">{isDevolution ? "↘" : "→"}</span>
          <span>{overlay.toStage.name}</span>
        </div>

        <div ref={battlefieldRef} className="evolution-screen__battlefield relative z-10 mt-10 flex items-center justify-center">
          <div ref={pillarRef} className="evolution-screen__pillar" />
          <div ref={outerRingRef} className="evolution-screen__burst-ring evolution-screen__burst-ring--outer" />
          <div ref={innerRingRef} className="evolution-screen__burst-ring evolution-screen__burst-ring--inner" />
          <div ref={coreRef} className="evolution-screen__energy-core" />

          <div className="evolution-screen__sprite-anchor">
            <div ref={fromRef} className="evolution-screen__sprite evolution-screen__sprite--from">
              <PokemonBattleSprite stage={overlay.fromStage} maxWidth={250} />
            </div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <div ref={silhouetteRef} className="evolution-screen__sprite evolution-screen__sprite--silhouette">
              <PokemonBattleSprite stage={overlay.toStage} maxWidth={304} silhouette />
            </div>
          </div>

          <div className="evolution-screen__sprite-anchor">
            <div ref={toRef} className="evolution-screen__sprite evolution-screen__sprite--to">
              <PokemonBattleSprite stage={overlay.toStage} maxWidth={304} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
