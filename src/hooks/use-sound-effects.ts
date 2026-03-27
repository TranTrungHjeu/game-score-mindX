"use client";

import { useCallback, useRef } from "react";
import { Howl } from "howler";

const SOUND_FILES = {
  evolution: "/audio/evolution.mp3",
  mega: "/audio/mega.m4a",
} as const;

let evolutionHowl: Howl | null = null;
let megaHowl: Howl | null = null;

function getHowl(current: Howl | null, source: string, volume: number) {
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

function createEnvelope(context: AudioContext, type: OscillatorType, frequency: number, gainValue: number, duration: number, startTime: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
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

    createEnvelope(context, "triangle", 740, 0.08, 0.12, context.currentTime);
    createEnvelope(context, "sine", 1040, 0.06, 0.18, context.currentTime + 0.04);
  }, [enabled, getContext]);

  const stopEvolutionAudio = useCallback(() => {
    evolutionHowl?.stop();
    megaHowl?.stop();
  }, []);

  const playEvolutionWhoosh = useCallback(() => {
    if (!enabled) {
      return;
    }

    evolutionHowl = getHowl(evolutionHowl, SOUND_FILES.evolution, 0.5);
    evolutionHowl.stop();
    evolutionHowl.play();
  }, [enabled]);

  const playMegaEvolution = useCallback(() => {
    if (!enabled) {
      return;
    }

    megaHowl = getHowl(megaHowl, SOUND_FILES.mega, 0.54);
    megaHowl.stop();
    megaHowl.play();
  }, [enabled]);

  const playDevolutionSadTone = useCallback(() => {
    if (!enabled) {
      return;
    }

    const context = getContext();

    if (!context) {
      return;
    }

    const start = context.currentTime;
    createEnvelope(context, "triangle", 320, 0.05, 0.22, start);
    createEnvelope(context, "triangle", 220, 0.05, 0.26, start + 0.14);
    createEnvelope(context, "sine", 160, 0.04, 0.32, start + 0.3);
  }, [enabled, getContext]);

  return {
    playScoreDing,
    playEvolutionWhoosh,
    playMegaEvolution,
    playDevolutionSadTone,
    stopEvolutionAudio,
  };
}
