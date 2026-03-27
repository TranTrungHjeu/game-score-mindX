import { DEFAULT_MISSIONS, DEFAULT_TEAM_NAMES, MASCOT_FAMILIES, TEAM_LIMITS, getFamilyById } from "@/lib/constants";
import { getEvolutionStage, getEvolutionStageCount, isMegaUnlocked, resolveMegaStage, supportsMegaEvolution, withMegaForms } from "@/lib/pokemon-helpers";
import { createId } from "@/lib/utils";
import {
  EVOLUTION_THRESHOLDS,
  type ClassroomState,
  type EvolutionStage,
  type MascotFamily,
  type MegaQuestion,
  type MegaVariant,
  type Mission,
  type OverlayEvent,
  type QuestionSeed,
  type SessionPayload,
  type Team,
  type TeamSeed,
  type TransformationKind,
} from "@/lib/types";

type LegacyTeam = Partial<Team> & {
  mascot?: MascotFamily;
  mascotFamily?: string;
};

type LegacyOverlay = Partial<OverlayEvent> & {
  mascot?: MascotFamily;
  mascotFamily?: string;
};

type LegacyQuestion = Partial<MegaQuestion>;

function resolveMascot(input: MascotFamily | string | undefined) {
  if (!input) {
    return MASCOT_FAMILIES[0];
  }

  return typeof input === "string" ? getFamilyById(input) : withMegaForms(input);
}

function resolveInitialMegaVariant(mascot: MascotFamily, megaVariant?: MegaVariant | null) {
  if (!supportsMegaEvolution(mascot)) {
    return null;
  }

  if (megaVariant && mascot.megaForms?.some((stage) => stage.variant === megaVariant)) {
    return megaVariant;
  }

  return mascot.megaForms?.find((stage) => stage.variant)?.variant ?? null;
}

function cloneStage(stage: EvolutionStage) {
  return { ...stage };
}

function clampTeamLevel(mascot: MascotFamily, level: number) {
  return Math.max(1, Math.min(level, getEvolutionStageCount(mascot)));
}

function buildQuestion(seed: QuestionSeed, index: number): MegaQuestion {
  return {
    id: seed.id ?? createId(`question-${index + 1}`),
    prompt: seed.prompt.trim(),
    winnerTeamId: null,
    awardedAt: null,
  };
}

function buildEmptyQuestion(index: number): MegaQuestion {
  return {
    id: createId(`question-${index + 1}`),
    prompt: "",
    winnerTeamId: null,
    awardedAt: null,
  };
}

function isMegaQuestionSeed(question: QuestionSeed | MegaQuestion): question is MegaQuestion {
  return "winnerTeamId" in question && "awardedAt" in question;
}

function getNormalizedQuestions(questions: QuestionSeed[] | MegaQuestion[] | undefined) {
  return (questions ?? [])
    .slice(0, 5)
    .map((question, index) => {
      if (isMegaQuestionSeed(question)) {
        return {
          id: question.id ?? createId(`question-${index + 1}`),
          prompt: question.prompt?.trim() ?? "",
          winnerTeamId: question.winnerTeamId ?? null,
          awardedAt: question.awardedAt ?? null,
        };
      }

      return buildQuestion(question, index);
    });
}

function createSessionName(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return `${day}${month}${year}`;
}

export function createEmptyClassroomState(): ClassroomState {
  return {
    teams: [],
    currentMission: null,
    questions: [],
    audioEnabled: true,
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
    megaVariant: resolveInitialMegaVariant(mascot, seed.megaVariant ?? null),
    megaActive: false,
    lastTransform: null,
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
      megaVariant: resolveInitialMegaVariant(family, null),
    };
  });
}

export function createSessionFromTeams(payload: SessionPayload): ClassroomState {
  const seeds = payload.teams.slice(0, TEAM_LIMITS.max);
  const teams = seeds.map(buildTeam);
  const fallbackTeams = createDefaultTeamSeeds(TEAM_LIMITS.min).map(buildTeam);
  const questions = getNormalizedQuestions(payload.questions);

  return {
    teams: teams.length >= TEAM_LIMITS.min ? teams : fallbackTeams,
    currentMission: { ...DEFAULT_MISSIONS[0], status: "active" },
    questions,
    audioEnabled: true,
    overlayQueue: [],
    lastUpdatedAt: Date.now(),
    sessionId: createSessionName(),
  };
}

function normalizeOverlayStage(
  mascot: MascotFamily,
  kind: TransformationKind,
  stage: EvolutionStage | undefined,
  level: number,
  megaVariant: MegaVariant | null,
  isTarget: boolean,
) {
  if (stage) {
    return cloneStage(stage);
  }

  if (kind === "mega" && isTarget) {
    return cloneStage(resolveMegaStage(mascot, megaVariant) ?? getEvolutionStage(mascot, level));
  }

  return cloneStage(getEvolutionStage(mascot, level));
}

function normalizeLegacyOverlay(overlay: OverlayEvent | LegacyOverlay): OverlayEvent {
  const mascot =
    "mascot" in overlay && overlay.mascot
      ? resolveMascot(overlay.mascot)
      : "mascotFamily" in overlay
        ? resolveMascot(overlay.mascotFamily)
        : MASCOT_FAMILIES[0];
  const maxLevel = getEvolutionStageCount(mascot);
  const kind = overlay.kind ?? "evolution";
  const fromLevel = clampTeamLevel(mascot, overlay.fromLevel ?? 1);
  const toLevel = clampTeamLevel(mascot, overlay.toLevel ?? fromLevel);
  const megaVariant = resolveInitialMegaVariant(mascot, overlay.megaVariant ?? null);

  return {
    id: overlay.id ?? createId("overlay"),
    kind,
    teamId: overlay.teamId ?? createId("team"),
    teamName: overlay.teamName ?? "Đội",
    mascot,
    accentColor: overlay.accentColor || mascot.accent,
    fromLevel: clampTeamLevel(mascot, Math.min(fromLevel, maxLevel)),
    toLevel: clampTeamLevel(mascot, Math.min(toLevel, maxLevel)),
    fromStage: normalizeOverlayStage(mascot, kind, overlay.fromStage, fromLevel, megaVariant, false),
    toStage: normalizeOverlayStage(mascot, kind, overlay.toStage, toLevel, megaVariant, true),
    createdAt: overlay.createdAt ?? Date.now(),
    megaVariant,
  };
}

function normalizeLegacyTeam(team: Team | LegacyTeam, questions: MegaQuestion[]): Team {
  const mascot =
    "mascot" in team && team.mascot
      ? resolveMascot(team.mascot)
      : "mascotFamily" in team
        ? resolveMascot(team.mascotFamily)
        : MASCOT_FAMILIES[0];
  const score = clampScore(team.score ?? 0);
  const unlockedLevel = clampTeamLevel(mascot, getLevelFromScore(score, getEvolutionStageCount(mascot)));
  const displayLevel = clampTeamLevel(mascot, team.displayLevel ?? unlockedLevel);
  const megaVariant = resolveInitialMegaVariant(mascot, team.megaVariant ?? null);
  const megaStillUnlocked =
    Boolean(team.megaActive) &&
    unlockedLevel >= getEvolutionStageCount(mascot) &&
    (!questions.length || isMegaUnlocked({ ...(team as Team), mascot, unlockedLevel, megaVariant, megaActive: true } as Team, questions));

  return {
    id: team.id ?? createId("team"),
    name: team.name?.trim() || "Đội",
    mascot,
    score,
    unlockedLevel,
    displayLevel,
    accentColor: team.accentColor || mascot.accent,
    lastDelta: team.lastDelta ?? 0,
    megaVariant,
    megaActive: supportsMegaEvolution(mascot) ? megaStillUnlocked : false,
    lastTransform: team.lastTransform ? normalizeLegacyOverlay(team.lastTransform) : null,
  };
}

function normalizeQuestion(question: LegacyQuestion, index: number): MegaQuestion {
  return {
    id: question.id ?? createId(`question-${index + 1}`),
    prompt: question.prompt?.trim() ?? "",
    winnerTeamId: question.winnerTeamId ?? null,
    awardedAt: question.awardedAt ?? null,
  };
}

export function normalizeClassroomState(state: ClassroomState): ClassroomState {
  const questions = (state.questions ?? []).map(normalizeQuestion).slice(0, 5);

  return {
    ...state,
    questions,
    teams: state.teams.map((team) => normalizeLegacyTeam(team as Team | LegacyTeam, questions)),
    overlayQueue: state.overlayQueue.map((overlay) => normalizeLegacyOverlay(overlay as OverlayEvent | LegacyOverlay)),
  };
}

function createTransformationEvent(
  team: Team,
  kind: TransformationKind,
  fromLevel: number,
  toLevel: number,
  fromStage: EvolutionStage,
  toStage: EvolutionStage,
) {
  return {
    id: createId(kind),
    kind,
    teamId: team.id,
    teamName: team.name,
    mascot: team.mascot,
    accentColor: team.accentColor,
    fromLevel,
    toLevel,
    fromStage: cloneStage(fromStage),
    toStage: cloneStage(toStage),
    createdAt: Date.now(),
    megaVariant: team.megaVariant,
  } satisfies OverlayEvent;
}

function reconcileQuestionChange(state: ClassroomState, questions: MegaQuestion[]) {
  const overlaysAdded: OverlayEvent[] = [];

  const teams = state.teams.map((team) => {
    if (!team.megaActive) {
      return team;
    }

    const maxLevel = getEvolutionStageCount(team.mascot);
    const keepMega = team.unlockedLevel >= maxLevel && isMegaUnlocked(team, questions);

    if (keepMega) {
      return team;
    }

    const fromStage = resolveMegaStage(team.mascot, team.megaVariant) ?? getEvolutionStage(team.mascot, team.displayLevel);
    const toStage = getEvolutionStage(team.mascot, team.unlockedLevel);
    const overlay =
      fromStage.name !== toStage.name
        ? createTransformationEvent(team, "devolution", team.displayLevel, team.unlockedLevel, fromStage, toStage)
        : null;

    if (overlay) {
      overlaysAdded.push(overlay);
    }

    return {
      ...team,
      megaActive: false,
      lastTransform: overlay ?? team.lastTransform,
    };
  });

  return {
    teams,
    overlaysAdded,
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
    const keepMega = team.megaActive && nextScore >= getThresholdForLevel(maxLevel);
    const currentVisibleStage = team.megaActive ? resolveMegaStage(team.mascot, team.megaVariant) ?? getEvolutionStage(team.mascot, team.displayLevel) : getEvolutionStage(team.mascot, team.displayLevel);

    if (delta > 0 && scoreLevel > team.unlockedLevel && !team.megaActive) {
      for (let level = team.unlockedLevel + 1; level <= scoreLevel; level += 1) {
        const fromLevel = Math.max(1, level - 1);
        const overlay = createTransformationEvent(
          team,
          "evolution",
          fromLevel,
          level,
          getEvolutionStage(team.mascot, fromLevel),
          getEvolutionStage(team.mascot, level),
        );
        overlaysAdded.push(overlay);
      }
    }

    if (delta < 0) {
      const targetStage = getEvolutionStage(team.mascot, scoreLevel);
      const shouldDevolve = scoreLevel < team.unlockedLevel || (team.megaActive && !keepMega);

      if (shouldDevolve && currentVisibleStage.name !== targetStage.name) {
        overlaysAdded.push(
          createTransformationEvent(
            team,
            "devolution",
            team.displayLevel,
            scoreLevel,
            currentVisibleStage,
            targetStage,
          ),
        );
      }
    }

    const latestTransform = overlaysAdded.filter((overlay) => overlay.teamId === team.id).at(-1) ?? team.lastTransform;

    return {
      ...team,
      score: nextScore,
      unlockedLevel: scoreLevel,
      lastDelta: delta,
      megaActive: keepMega,
      lastTransform: latestTransform,
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

export function setQuestionWinnerInState(state: ClassroomState, questionId: string, teamId: string | null) {
  const targetQuestion = state.questions.find((question) => question.id === questionId);

  if (!targetQuestion || (targetQuestion.prompt.trim().length === 0 && teamId !== null)) {
    return state;
  }

  const questions = state.questions.map((question) =>
    question.id === questionId
      ? {
          ...question,
          winnerTeamId: question.winnerTeamId === teamId ? null : teamId,
          awardedAt: question.winnerTeamId === teamId ? null : Date.now(),
        }
      : question,
  );
  const { teams, overlaysAdded } = reconcileQuestionChange(state, questions);

  return {
    ...state,
    questions,
    teams,
    overlayQueue: [...state.overlayQueue, ...overlaysAdded],
    lastUpdatedAt: Date.now(),
  };
}

export function updateQuestionPromptInState(state: ClassroomState, questionId: string, prompt: string) {
  let hasChanged = false;

  const questions = state.questions.map((question) => {
    if (question.id !== questionId) {
      return question;
    }

    hasChanged = true;
    const nextPrompt = prompt;
    const isBlank = nextPrompt.trim().length === 0;

    return {
      ...question,
      prompt: nextPrompt,
      winnerTeamId: isBlank ? null : question.winnerTeamId,
      awardedAt: isBlank ? null : question.awardedAt,
    };
  });

  if (!hasChanged) {
    return state;
  }

  const { teams, overlaysAdded } = reconcileQuestionChange(state, questions);

  return {
    ...state,
    questions,
    teams,
    overlayQueue: [...state.overlayQueue, ...overlaysAdded],
    lastUpdatedAt: Date.now(),
  };
}

export function addQuestionInState(state: ClassroomState) {
  if (state.questions.length >= 5) {
    return state;
  }

  return {
    ...state,
    questions: [...state.questions, buildEmptyQuestion(state.questions.length)],
    lastUpdatedAt: Date.now(),
  };
}

export function removeQuestionInState(state: ClassroomState, questionId: string) {
  const questions = state.questions.filter((question) => question.id !== questionId);

  if (questions.length === state.questions.length) {
    return state;
  }

  const { teams, overlaysAdded } = reconcileQuestionChange(state, questions);

  return {
    ...state,
    questions,
    teams,
    overlayQueue: [...state.overlayQueue, ...overlaysAdded],
    lastUpdatedAt: Date.now(),
  };
}

export function replayEvolutionInState(state: ClassroomState, teamId: string) {
  const team = state.teams.find((item) => item.id === teamId);

  if (!team?.lastTransform) {
    return {
      nextState: state,
      overlay: null,
    };
  }

  const overlay = {
    ...team.lastTransform,
    id: createId(`${team.lastTransform.kind}-replay`),
    createdAt: Date.now(),
  };

  return {
    nextState: {
      ...state,
      overlayQueue: [...state.overlayQueue, overlay],
      lastUpdatedAt: Date.now(),
    },
    overlay,
  };
}

export function triggerMegaEvolutionInState(state: ClassroomState, teamId: string) {
  let overlay: OverlayEvent | null = null;

  const teams = state.teams.map((team) => {
    if (team.id !== teamId) {
      return team;
    }

    if (!supportsMegaEvolution(team.mascot) || team.megaActive || !isMegaUnlocked(team, state.questions)) {
      return team;
    }

    const maxLevel = getEvolutionStageCount(team.mascot);

    if (team.unlockedLevel < maxLevel) {
      return team;
    }

    const megaStage = resolveMegaStage(team.mascot, team.megaVariant);

    if (!megaStage) {
      return team;
    }

    overlay = createTransformationEvent(
      team,
      "mega",
      maxLevel,
      maxLevel,
      getEvolutionStage(team.mascot, maxLevel),
      megaStage,
    );

    return {
      ...team,
      megaActive: true,
      lastTransform: overlay,
    };
  });

  if (!overlay) {
    return {
      nextState: state,
      overlay: null,
    };
  }

  return {
    nextState: {
      ...state,
      teams,
      overlayQueue: [...state.overlayQueue, overlay],
      lastUpdatedAt: Date.now(),
    },
    overlay,
  };
}

export function finalizeDisplayedEvolution(state: ClassroomState, overlayId: string) {
  const activeOverlay = state.overlayQueue.find((overlay) => overlay.id === overlayId);

  if (!activeOverlay) {
    return state;
  }

  return {
    ...state,
    teams: state.teams.map((team) =>
      team.id === activeOverlay.teamId
        ? {
            ...team,
            displayLevel: clampTeamLevel(team.mascot, activeOverlay.toLevel),
            megaActive: activeOverlay.kind === "mega" ? true : team.megaActive,
          }
        : team,
    ),
    overlayQueue: state.overlayQueue.filter((overlay) => overlay.id !== overlayId),
    lastUpdatedAt: Date.now(),
  };
}

export function updateTeamMegaVariantInState(state: ClassroomState, teamId: string, megaVariant: MegaVariant | null) {
  return {
    ...state,
    teams: state.teams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            megaVariant: resolveInitialMegaVariant(team.mascot, megaVariant),
          }
        : team,
    ),
    lastUpdatedAt: Date.now(),
  };
}

export function resetSessionState() {
  return createEmptyClassroomState();
}
