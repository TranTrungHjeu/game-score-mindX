"use client";

import { useEffect } from "react";

import { getBroadcastChannel } from "@/lib/storage";
import type { ClassroomState } from "@/lib/types";
import { useClassroomStore } from "@/store/use-classroom-store";

export function useClassroomSync() {
  const hydrateFromStorage = useClassroomStore((state) => state.hydrateFromStorage);
  const syncFromBroadcast = useClassroomStore((state) => state.syncFromBroadcast);

  useEffect(() => {
    hydrateFromStorage();

    const channel = getBroadcastChannel();

    if (!channel) {
      return;
    }

    const handler = (event: MessageEvent<ClassroomState>) => {
      if (event.data) {
        syncFromBroadcast(event.data);
      }
    };

    channel.addEventListener("message", handler);

    return () => {
      channel.removeEventListener("message", handler);
    };
  }, [hydrateFromStorage, syncFromBroadcast]);
}
