export const EVOLUTION_THRESHOLDS = [0, 10, 20] as const;

export type MegaVariant = "x" | "y";

export type TransformationKind = "evolution" | "devolution" | "mega";

export type EvolutionStage = {
  id: number;
  name: string;
  artworkPath: string;
  animatedPath: string;
  summary: string;
  showdownName?: string;
  variant?: MegaVariant | null;
};

export type MascotFamily = {
  id: string;
  name: string;
  accent: string;
  secondary: string;
  description: string;
  evolutionChain: EvolutionStage[];
  megaForms?: EvolutionStage[];
  source?: {
    speciesId: number;
    evolutionChainId?: number;
  };
};

export type MissionStatus = "idle" | "active" | "completed";

export type MegaQuestion = {
  id: string;
  prompt: string;
  winnerTeamId: string | null;
  awardedAt: number | null;
};

export type OverlayEvent = {
  id: string;
  kind: TransformationKind;
  teamId: string;
  teamName: string;
  mascot: MascotFamily;
  accentColor: string;
  fromLevel: number;
  toLevel: number;
  fromStage: EvolutionStage;
  toStage: EvolutionStage;
  createdAt: number;
  megaVariant?: MegaVariant | null;
};

export type Team = {
  id: string;
  name: string;
  mascot: MascotFamily;
  score: number;
  unlockedLevel: number;
  displayLevel: number;
  accentColor: string;
  lastDelta: number;
  megaVariant: MegaVariant | null;
  megaActive: boolean;
  lastTransform: OverlayEvent | null;
};

export type Mission = {
  id: string;
  title: string;
  icon: string;
  suggestedPoints: number;
  status: MissionStatus;
};

export type ClassroomState = {
  teams: Team[];
  currentMission: Mission | null;
  questions: MegaQuestion[];
  audioEnabled: boolean;
  overlayQueue: OverlayEvent[];
  lastUpdatedAt: number | null;
  sessionId: string | null;
};

export type TeamSeed = {
  id?: string;
  name: string;
  mascot: MascotFamily;
  megaVariant?: MegaVariant | null;
};

export type QuestionSeed = {
  id?: string;
  prompt: string;
};

export type SessionPayload = {
  teams: TeamSeed[];
  questions?: QuestionSeed[];
};

export type ScoreUpdateResult = {
  team: Team | null;
  overlaysAdded: OverlayEvent[];
};
