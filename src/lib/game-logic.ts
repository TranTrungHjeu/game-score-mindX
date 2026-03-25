import { DEFAULT_MISSIONS, DEFAULT_TEAM_NAMES, MASCOT_FAMILIES, TEAM_LIMITS, getEvolutionStageCount, getFamilyById } from "@/lib/constants";
import { createId } from "@/lib/utils";
import {
  EVOLUTION_THRESHOLDS,
  type ClassroomState,
  type MascotFamily,
  type Mission,
  type OverlayEvent,
  type SessionPayload,
  type Team,
  type TeamSeed,
} from "@/lib/types";

type LegacyTeam = Omit<Team, "mascot"> & {
  mascotFamily?: string;
};

type LegacyOverlay = Omit<OverlayEvent, "mascot"> & {
  mascotFamily?: string;
};

function resolveMascot(input: MascotFamily | string | undefined) {
  if (!input) {
    return MASCOT_FAMILIES[0];
  }

  return typeof input === "string" ? getFamilyById(input) : input;
}

export function createEmptyClassroomState(): ClassroomState {
  return {
    teams: [],
    currentMission: null,
    audioEnabled: false,
    overlayQueue: [],
    lastUpdatedAt: null,
    sessionId: null,
  };
}

export function clampScore(score: number) {
  return Math.max(0, score);
}

export function getLevelFromScore(score: number, maxLevel: number = EVOLUTION_THRESHOLDS.length) {
  const safeScore = clampScore(score);

  for (let index = EVOLUTION_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    if (safeScore >= EVOLUTION_THRESHOLDS[index]) {
      return Math.min(index + 1, maxLevel);
    }
  }

  return 1;
}

export function getThresholdForLevel(level: number) {
  return EVOLUTION_THRESHOLDS[Math.max(0, Math.min(level - 1, EVOLUTION_THRESHOLDS.length - 1))];
}

export function getNextThreshold(level: number) {
  if (level >= EVOLUTION_THRESHOLDS.length) {
    return null;
  }

  return EVOLUTION_THRESHOLDS[level];
}

export function getProgressToNextLevel(
  score: number,
  unlockedLevel: number,
  maxLevel: number = EVOLUTION_THRESHOLDS.length,
) {
  if (unlockedLevel >= maxLevel) {
    return 1;
  }

  const currentFloor = getThresholdForLevel(unlockedLevel);
  const nextThreshold = getNextThreshold(unlockedLevel);

  if (nextThreshold === null) {
    return 1;
  }

  const safeProgress = Math.max(score, currentFloor) - currentFloor;
  return Math.max(0, Math.min(1, safeProgress / (nextThreshold - currentFloor)));
}

export function rankTeams(teams: Team[]) {
  return [...teams].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.unlockedLevel !== left.unlockedLevel) {
      return right.unlockedLevel - left.unlockedLevel;
    }

    return left.name.localeCompare(right.name, "vi");
  });
}

export function buildMissionState(id: string): Mission | null {
  const found = DEFAULT_MISSIONS.find((mission) => mission.id === id);
  return found ? { ...found, status: "active" } : null;
}

export function buildTeam(seed: TeamSeed, index: number): Team {
  const mascot = resolveMascot(seed.mascot);

  return {
    id: seed.id ?? createId(`team-${index + 1}`),
    name: seed.name.trim() || DEFAULT_TEAM_NAMES[index] || `Team ${index + 1}`,
    mascot,
    score: 0,
    unlockedLevel: 1,
    displayLevel: 1,
    accentColor: mascot.accent,
    lastDelta: 0,
  };
}

export function createDefaultTeamSeeds(count: number, families: MascotFamily[] = MASCOT_FAMILIES) {
  const safeCount = Math.max(TEAM_LIMITS.min, Math.min(count, TEAM_LIMITS.max));

  return Array.from({ length: safeCount }, (_, index) => {
    const family = families[index % families.length] ?? MASCOT_FAMILIES[index % MASCOT_FAMILIES.length];
    return {
      id: createId(`seed-${index + 1}`),
      name: DEFAULT_TEAM_NAMES[index] ?? `Team ${index + 1}`,
      mascot: family,
    };
  });
}

export function createSessionFromTeams(payload: SessionPayload): ClassroomState {
  const seeds = payload.teams.slice(0, TEAM_LIMITS.max);
  const teams = seeds.map(buildTeam);
  const fallbackTeams = createDefaultTeamSeeds(TEAM_LIMITS.min).map(buildTeam);

  return {
    teams: teams.length >= TEAM_LIMITS.min ? teams : fallbackTeams,
    currentMission: { ...DEFAULT_MISSIONS[0], status: "active" },
    audioEnabled: false,
    overlayQueue: [],
    lastUpdatedAt: Date.now(),
    sessionId: createId("session"),
  };
}

function clampTeamLevel(mascot: MascotFamily, level: number) {
  return Math.max(1, Math.min(level, getEvolutionStageCount(mascot)));
}

function normalizeLegacyTeam(team: Team | LegacyTeam): Team {
  const mascot =
    "mascot" in team && team.mascot
      ? resolveMascot(team.mascot)
      : "mascotFamily" in team
        ? resolveMascot(team.mascotFamily)
        : MASCOT_FAMILIES[0];

  return {
    ...team,
    mascot,
    accentColor: team.accentColor || mascot.accent,
  };
}

function normalizeLegacyOverlay(overlay: OverlayEvent | LegacyOverlay): OverlayEvent {
  const mascot =
    "mascot" in overlay && overlay.mascot
      ? resolveMascot(overlay.mascot)
      : "mascotFamily" in overlay
        ? resolveMascot(overlay.mascotFamily)
        : MASCOT_FAMILIES[0];

  return {
    ...overlay,
    mascot,
    accentColor: overlay.accentColor || mascot.accent,
  };
}

export function normalizeClassroomState(state: ClassroomState): ClassroomState {
  return {
    ...state,
    teams: state.teams.map((team) => {
      const normalizedTeam = normalizeLegacyTeam(team as Team | LegacyTeam);
      return {
        ...normalizedTeam,
        score: clampScore(normalizedTeam.score),
        unlockedLevel: clampTeamLevel(normalizedTeam.mascot, normalizedTeam.unlockedLevel),
        displayLevel: clampTeamLevel(normalizedTeam.mascot, normalizedTeam.displayLevel),
      };
    }),
    overlayQueue: state.overlayQueue.map((overlay) => {
      const normalizedOverlay = normalizeLegacyOverlay(overlay as OverlayEvent | LegacyOverlay);
      return {
        ...normalizedOverlay,
        fromLevel: clampTeamLevel(normalizedOverlay.mascot, normalizedOverlay.fromLevel),
        toLevel: clampTeamLevel(normalizedOverlay.mascot, normalizedOverlay.toLevel),
      };
    }),
  };
}

export function createEvolutionEvent(team: Team, fromLevel: number, toLevel: number): OverlayEvent {
  return {
    id: createId("evolution"),
    teamId: team.id,
    teamName: team.name,
    mascot: team.mascot,
    accentColor: team.accentColor,
    fromLevel,
    toLevel,
    createdAt: Date.now(),
  };
}

export function updateTeamScoreInState(state: ClassroomState, teamId: string, delta: number) {
  const overlaysAdded: OverlayEvent[] = [];

  const teams = state.teams.map((team) => {
    if (team.id !== teamId) {
      return team;
    }

    const nextScore = clampScore(team.score + delta);
    const maxLevel = getEvolutionStageCount(team.mascot);
    const scoreLevel = getLevelFromScore(nextScore, maxLevel);
    const nextUnlockedLevel = Math.max(team.unlockedLevel, scoreLevel);

    for (let level = team.unlockedLevel + 1; level <= nextUnlockedLevel; level += 1) {
      overlaysAdded.push(createEvolutionEvent(team, level - 1, level));
    }

    return {
      ...team,
      score: nextScore,
      unlockedLevel: nextUnlockedLevel,
      lastDelta: delta,
    };
  });

  return {
    nextState: {
      ...state,
      teams,
      overlayQueue: [...state.overlayQueue, ...overlaysAdded],
      lastUpdatedAt: Date.now(),
    },
    overlaysAdded,
  };
}

export function setMissionInState(state: ClassroomState, missionId: string) {
  return {
    ...state,
    currentMission: buildMissionState(missionId),
    lastUpdatedAt: Date.now(),
  };
}

export function replayEvolutionInState(state: ClassroomState, teamId: string) {
  const team = state.teams.find((item) => item.id === teamId);

  if (!team || team.unlockedLevel <= 1) {
    return {
      nextState: state,
      overlay: null,
    };
  }

  const overlay = createEvolutionEvent(team, Math.max(1, team.unlockedLevel - 1), team.unlockedLevel);

  return {
    nextState: {
      ...state,
      overlayQueue: [...state.overlayQueue, overlay],
      lastUpdatedAt: Date.now(),
    },
    overlay,
  };
}

export function finalizeDisplayedEvolution(state: ClassroomState, overlayId: string, teamId: string, toLevel: number) {
  return {
    ...state,
    teams: state.teams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            displayLevel: clampTeamLevel(team.mascot, Math.max(team.displayLevel, toLevel)),
          }
        : team,
    ),
    overlayQueue: state.overlayQueue.filter((overlay) => overlay.id !== overlayId),
    lastUpdatedAt: Date.now(),
  };
}

export function resetSessionState() {
  return createEmptyClassroomState();
}
