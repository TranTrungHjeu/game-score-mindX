"use client";

import { useCallback, useRef } from "react";

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

  const playEvolutionWhoosh = useCallback(() => {
    if (!enabled) {
      return;
    }

    const context = getContext();

    if (!context) {
      return;
    }

    playTone(context, 220, 0.3, "sawtooth", 0.05);
    playTone(context, 440, 0.4, "square", 0.05, 0.08);
    playTone(context, 880, 0.5, "triangle", 0.04, 0.16);
  }, [enabled, getContext]);

  return {
    playScoreDing,
    playEvolutionWhoosh,
  };
}
