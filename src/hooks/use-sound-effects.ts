"use client";

import { useCallback, useRef } from "react";
import { Howl } from "howler";

const SOUND_FILES = {
  evolutionCharge: "/audio/evolution-charge.wav",
  evolutionFlash: "/audio/evolution-flash.wav",
  evolutionReveal: "/audio/evolution-reveal.wav",
} as const;

let evolutionChargeHowl: Howl | null = null;
let evolutionFlashHowl: Howl | null = null;
let evolutionRevealHowl: Howl | null = null;

function getHowl(
  current: Howl | null,
  source: string,
  volume: number,
) {
  if (current) {
    return current;
  }

  return new Howl({
    src: [source],
    volume,
    preload: true,
    html5: false,
  });
}

function useAudioContext() {
  const contextRef = useRef<AudioContext | null>(null);

  return useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContextClass();
    }

    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }

    return contextRef.current;
  }, []);
}

function playTone(
  context: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  delay = 0,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime + delay);
  gain.gain.setValueAtTime(0.0001, context.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(gainValue, context.currentTime + delay + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(context.currentTime + delay);
  oscillator.stop(context.currentTime + delay + duration + 0.05);
}

export function useSoundEffects(enabled: boolean) {
  const getContext = useAudioContext();

  const playScoreDing = useCallback(() => {
    if (!enabled) {
      return;
    }

    const context = getContext();

    if (!context) {
      return;
    }

    playTone(context, 740, 0.12, "triangle", 0.08);
    playTone(context, 1040, 0.18, "sine", 0.06, 0.04);
  }, [enabled, getContext]);

  const stopEvolutionAudio = useCallback(() => {
    evolutionChargeHowl?.stop();
    evolutionFlashHowl?.stop();
    evolutionRevealHowl?.stop();
  }, []);

  const playEvolutionCharge = useCallback(() => {
    if (!enabled) {
      return;
    }

    evolutionChargeHowl = getHowl(evolutionChargeHowl, SOUND_FILES.evolutionCharge, 0.38);
    evolutionChargeHowl.stop();
    evolutionChargeHowl.play();
  }, [enabled]);

  const playEvolutionFlash = useCallback(() => {
    if (!enabled) {
      return;
    }

    evolutionFlashHowl = getHowl(evolutionFlashHowl, SOUND_FILES.evolutionFlash, 0.44);
    evolutionFlashHowl.stop();
    evolutionFlashHowl.play();
  }, [enabled]);

  const playEvolutionReveal = useCallback(() => {
    if (!enabled) {
      return;
    }

    evolutionRevealHowl = getHowl(evolutionRevealHowl, SOUND_FILES.evolutionReveal, 0.42);
    evolutionRevealHowl.stop();
    evolutionRevealHowl.play();
  }, [enabled]);

  const playEvolutionWhoosh = useCallback(() => {
    playEvolutionCharge();
  }, [playEvolutionCharge]);

  return {
    playScoreDing,
    playEvolutionWhoosh,
    playEvolutionCharge,
    playEvolutionFlash,
    playEvolutionReveal,
    stopEvolutionAudio,
  };
}
