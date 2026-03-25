import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach, vi } from "vitest";

class BroadcastChannelMock {
  listeners = new Map<string, Set<(event: MessageEvent) => void>>();

  addEventListener(type: string, callback: (event: MessageEvent) => void) {
    const current = this.listeners.get(type) ?? new Set();
    current.add(callback);
    this.listeners.set(type, current);
  }

  removeEventListener(type: string, callback: (event: MessageEvent) => void) {
    this.listeners.get(type)?.delete(callback);
  }

  postMessage(data: unknown) {
    const event = { data } as MessageEvent;
    this.listeners.get("message")?.forEach((listener) => listener(event));
  }

  close() {}
}

Object.defineProperty(window, "BroadcastChannel", {
  writable: true,
  value: BroadcastChannelMock,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, "open", {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn(() => true),
});

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});
