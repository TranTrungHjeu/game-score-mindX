export const EVOLUTION_THRESHOLDS = [0, 10, 20] as const;

export type EvolutionStage = {
  id: number;
  name: string;
  artworkPath: string;
  animatedPath: string;
  summary: string;
};

export type MascotFamily = {
  id: string;
  name: string;
  accent: string;
  secondary: string;
  description: string;
  evolutionChain: EvolutionStage[];
  source?: {
    speciesId: number;
    evolutionChainId?: number;
  };
};

export type MissionStatus = "idle" | "active" | "completed";

export type OverlayEvent = {
  id: string;
  teamId: string;
  teamName: string;
  mascot: MascotFamily;
  accentColor: string;
  fromLevel: number;
  toLevel: number;
  createdAt: number;
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
  audioEnabled: boolean;
  overlayQueue: OverlayEvent[];
  lastUpdatedAt: number | null;
  sessionId: string | null;
};

export type TeamSeed = {
  id?: string;
  name: string;
  mascot: MascotFamily;
};

export type SessionPayload = {
  teams: TeamSeed[];
};

export type ScoreUpdateResult = {
  team: Team | null;
  overlaysAdded: OverlayEvent[];
};
