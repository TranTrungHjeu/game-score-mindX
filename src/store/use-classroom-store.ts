"use client";

import { create } from "zustand";

import {
  addQuestionInState,
  createEmptyClassroomState,
  createSessionFromTeams,
  finalizeDisplayedEvolution,
  normalizeClassroomState,
  replayEvolutionInState,
  removeQuestionInState,
  resetSessionState,
  setMissionInState,
  updateQuestionPromptInState,
  setQuestionWinnerInState,
  triggerMegaEvolutionInState,
  updateTeamScoreInState,
} from "@/lib/game-logic";
import { broadcastState, clearStoredState, getStoredState, persistState } from "@/lib/storage";
import type {
  ClassroomState,
  OverlayEvent,
  ScoreUpdateResult,
  SessionPayload,
  Team,
} from "@/lib/types";

type ClassroomStore = ClassroomState & {
  isHydrated: boolean;
  history: ClassroomState[];
  createSession: (payload: SessionPayload) => void;
  updateTeamScore: (teamId: string, delta: number) => ScoreUpdateResult;
  undoLastScore: () => boolean;
  setMission: (missionId: string) => void;
  setQuestionWinner: (questionId: string, teamId: string | null) => void;
  updateQuestionPrompt: (questionId: string, prompt: string) => void;
  addQuestion: () => void;
  removeQuestion: (questionId: string) => void;
  replayEvolution: (teamId: string) => OverlayEvent | null;
  triggerMegaEvolution: (teamId: string) => OverlayEvent | null;
  toggleAudio: () => void;
  resetSession: () => void;
  hydrateFromStorage: () => void;
  syncFromBroadcast: (state: ClassroomState) => void;
  consumeEvolution: (overlayId: string) => void;
};

function snapshotState(state: ClassroomStore): ClassroomState {
  return {
    teams: state.teams,
    currentMission: state.currentMission,
    questions: state.questions,
    audioEnabled: state.audioEnabled,
    overlayQueue: state.overlayQueue,
    lastUpdatedAt: state.lastUpdatedAt,
    sessionId: state.sessionId,
  };
}

function publishState(state: ClassroomState) {
  persistState(state);
  broadcastState(state);
}

export const useClassroomStore = create<ClassroomStore>((set, get) => ({
  ...createEmptyClassroomState(),
  isHydrated: false,
  history: [],
  createSession: (payload) => {
    const nextState = createSessionFromTeams(payload);
    set({ ...nextState, isHydrated: true, history: [] });
    publishState(nextState);
  },
  updateTeamScore: (teamId, delta) => {
    const previousState = snapshotState(get());
    const { nextState, overlaysAdded } = updateTeamScoreInState(snapshotState(get()), teamId, delta);
    set({
      ...nextState,
      isHydrated: true,
      history: [...get().history.slice(-19), previousState],
    });
    publishState(nextState);

    return {
      team: nextState.teams.find((team) => team.id === teamId) ?? null,
      overlaysAdded,
    };
  },
  undoLastScore: () => {
    const previousState = get().history[get().history.length - 1];

    if (!previousState) {
      return false;
    }

    set({
      ...previousState,
      isHydrated: true,
      history: get().history.slice(0, -1),
    });
    publishState(previousState);
    return true;
  },
  setMission: (missionId) => {
    const nextState = setMissionInState(snapshotState(get()), missionId);
    set({ ...nextState, isHydrated: true });
    publishState(nextState);
  },
  setQuestionWinner: (questionId, teamId) => {
    const previousState = snapshotState(get());
    const nextState = setQuestionWinnerInState(snapshotState(get()), questionId, teamId);
    set({
      ...nextState,
      isHydrated: true,
      history: [...get().history.slice(-19), previousState],
    });
    publishState(nextState);
  },
  updateQuestionPrompt: (questionId, prompt) => {
    const nextState = updateQuestionPromptInState(snapshotState(get()), questionId, prompt);
    set({ ...nextState, isHydrated: true });
    publishState(nextState);
  },
  addQuestion: () => {
    const previousState = snapshotState(get());
    const nextState = addQuestionInState(snapshotState(get()));
    const didChange = nextState.questions.length !== previousState.questions.length;
    set({
      ...nextState,
      isHydrated: true,
      history: didChange ? [...get().history.slice(-19), previousState] : get().history,
    });
    publishState(nextState);
  },
  removeQuestion: (questionId) => {
    const previousState = snapshotState(get());
    const nextState = removeQuestionInState(snapshotState(get()), questionId);
    const didChange = nextState.questions.length !== previousState.questions.length;
    set({
      ...nextState,
      isHydrated: true,
      history: didChange ? [...get().history.slice(-19), previousState] : get().history,
    });
    publishState(nextState);
  },
  replayEvolution: (teamId) => {
    const { nextState, overlay } = replayEvolutionInState(snapshotState(get()), teamId);
    set({ ...nextState, isHydrated: true });
    publishState(nextState);
    return overlay;
  },
  triggerMegaEvolution: (teamId) => {
    const previousState = snapshotState(get());
    const { nextState, overlay } = triggerMegaEvolutionInState(snapshotState(get()), teamId);
    set({
      ...nextState,
      isHydrated: true,
      history: overlay ? [...get().history.slice(-19), previousState] : get().history,
    });
    publishState(nextState);
    return overlay;
  },
  toggleAudio: () => {
    const nextState = {
      ...snapshotState(get()),
      audioEnabled: !get().audioEnabled,
      lastUpdatedAt: Date.now(),
    };
    set({ ...nextState, isHydrated: true });
    publishState(nextState);
  },
  resetSession: () => {
    const nextState = resetSessionState();
    set({ ...nextState, isHydrated: true, history: [] });
    clearStoredState();
    broadcastState(nextState);
  },
  hydrateFromStorage: () => {
    const storedState = getStoredState();

    if (storedState) {
      set({ ...normalizeClassroomState(storedState), isHydrated: true, history: [] });
      return;
    }

    set({ ...createEmptyClassroomState(), isHydrated: true, history: [] });
  },
  syncFromBroadcast: (state) => {
    set({ ...normalizeClassroomState(state), isHydrated: true, history: [] });
  },
  consumeEvolution: (overlayId) => {
    const nextState = finalizeDisplayedEvolution(snapshotState(get()), overlayId);
    set({ ...nextState, isHydrated: true });
    publishState(nextState);
  },
}));

export function getLeaderTeam(teams: Team[]) {
  return [...teams].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.unlockedLevel !== left.unlockedLevel) {
      return right.unlockedLevel - left.unlockedLevel;
    }

    return left.name.localeCompare(right.name, "vi");
  })[0] ?? null;
}
