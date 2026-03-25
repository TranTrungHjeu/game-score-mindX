import { CHANNEL_NAME, STORAGE_KEY } from "@/lib/constants";
import type { ClassroomState } from "@/lib/types";

let channel: BroadcastChannel | null = null;
const CLIENT_ID = `${CHANNEL_NAME}:${Math.random().toString(36).slice(2, 10)}`;

type BroadcastPayload = {
  sourceId: string;
  state: ClassroomState;
};

function isBroadcastPayload(value: unknown): value is BroadcastPayload {
  return Boolean(
    value &&
      typeof value === "object" &&
      "sourceId" in value &&
      "state" in value,
  );
}

export function getStoredState() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as ClassroomState;
  } catch {
    return null;
  }
}

export function persistState(state: ClassroomState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearStoredState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function broadcastState(state: ClassroomState) {
  getBroadcastChannel()?.postMessage({
    sourceId: CLIENT_ID,
    state,
  } satisfies BroadcastPayload);
}

export function readBroadcastState(value: unknown) {
  if (isBroadcastPayload(value)) {
    return value.sourceId === CLIENT_ID ? null : value.state;
  }

  if (value && typeof value === "object" && "teams" in value) {
    return value as ClassroomState;
  }

  return null;
}

export function getBroadcastChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }

  return channel;
}
