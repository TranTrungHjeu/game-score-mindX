import type { EvolutionStage, MascotFamily, MegaQuestion, MegaVariant, Team } from "@/lib/types";

type MegaStageSeed = {
  id: number;
  name: string;
  showdownName: string;
  summary: string;
  variant?: MegaVariant;
};

const SHOWDOWN_ROOT = "https://play.pokemonshowdown.com/sprites";

const MEGA_STAGE_SEEDS: Record<string, MegaStageSeed[]> = {
  Venusaur: [
    {
      id: 10003,
      name: "Mega Venusaur",
      showdownName: "venusaurmega",
      summary: "Mega Venusaur bung nổ mạnh hơn, nhìn là thấy cả đội vừa bật sang một cấp rất cao.",
    },
  ],
  Charizard: [
    {
      id: 10034,
      name: "Mega Charizard X",
      showdownName: "charizardmegax",
      summary: "Mega Charizard X bùng nổ với cảm giác cực mạnh và rất hợp cho khoảnh khắc bứt phá.",
      variant: "x",
    },
    {
      id: 10035,
      name: "Mega Charizard Y",
      showdownName: "charizardmegay",
      summary: "Mega Charizard Y sáng rực và hoành tráng, rất hợp để chốt màn mega evolution.",
      variant: "y",
    },
  ],
  Blastoise: [
    {
      id: 10036,
      name: "Mega Blastoise",
      showdownName: "blastoisemega",
      summary: "Mega Blastoise trông chắc khỏe hơn hẳn, tạo cảm giác đội đã mở khóa sức mạnh lớn.",
    },
  ],
  Pidgeot: [
    {
      id: 10073,
      name: "Mega Pidgeot",
      showdownName: "pidgeotmega",
      summary: "Mega Pidgeot mang cảm giác tăng tốc rất rõ, hợp với những đội đang vào guồng.",
    },
  ],
  Alakazam: [
    {
      id: 10037,
      name: "Mega Alakazam",
      showdownName: "alakazammega",
      summary: "Mega Alakazam khiến màn hiển thị trông thông minh và mạnh mẽ hơn hẳn.",
    },
  ],
  Gengar: [
    {
      id: 10038,
      name: "Mega Gengar",
      showdownName: "gengarmega",
      summary: "Mega Gengar láu lỉnh và nổi bật, rất hợp cho khoảnh khắc cả lớp cùng reo lên.",
    },
  ],
  Gyarados: [
    {
      id: 10041,
      name: "Mega Gyarados",
      showdownName: "gyaradosmega",
      summary: "Mega Gyarados tạo cảm giác cực mạnh và đầy áp lực, rất hợp cho đội đang dẫn sâu.",
    },
  ],
  Ampharos: [
    {
      id: 10047,
      name: "Mega Ampharos",
      showdownName: "ampharosmega",
      summary: "Mega Ampharos mềm mại nhưng rất nổi bật, nhìn là biết đội vừa lên một đẳng cấp mới.",
    },
  ],
};

export function buildArtworkPath(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function buildAnimatedPath(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}

function buildShowdownDexPath(showdownName: string) {
  return `${SHOWDOWN_ROOT}/dex/${showdownName.replace(/([a-z])mega([xy])?$/, "$1-mega$2")}.png`;
}

function buildShowdownAnimatedPath(showdownName: string) {
  return `${SHOWDOWN_ROOT}/gen5ani/${showdownName.replace(/([a-z])mega([xy])?$/, "$1-mega$2")}.gif`;
}

function getFinalStageName(family: MascotFamily) {
  return family.evolutionChain[family.evolutionChain.length - 1]?.name ?? family.name;
}

function buildMegaStage(seed: MegaStageSeed): EvolutionStage {
  return {
    id: seed.id,
    name: seed.name,
    artworkPath: buildShowdownDexPath(seed.showdownName),
    animatedPath: buildShowdownAnimatedPath(seed.showdownName),
    summary: seed.summary,
    showdownName: seed.showdownName,
    variant: seed.variant ?? null,
  };
}

export function withMegaForms(family: MascotFamily): MascotFamily {
  if (family.megaForms?.length) {
    return family;
  }

  const megaSeeds = MEGA_STAGE_SEEDS[getFinalStageName(family)];

  if (!megaSeeds?.length) {
    return family;
  }

  return {
    ...family,
    megaForms: megaSeeds.map(buildMegaStage),
  };
}

export function getEvolutionStageCount(family: MascotFamily) {
  return family.evolutionChain.length;
}

export function getEvolutionStage(family: MascotFamily, level: number) {
  const safeIndex = Math.max(0, Math.min(level - 1, family.evolutionChain.length - 1));
  return family.evolutionChain[safeIndex] ?? family.evolutionChain[0];
}

export function supportsMegaEvolution(family: MascotFamily) {
  return Boolean(family.megaForms?.length);
}

export function resolveMegaStage(family: MascotFamily, megaVariant: MegaVariant | null) {
  if (!family.megaForms?.length) {
    return null;
  }

  if (megaVariant) {
    const matched = family.megaForms.find((stage) => stage.variant === megaVariant);

    if (matched) {
      return matched;
    }
  }

  return family.megaForms[0] ?? null;
}

export function getMegaWinsForTeam(teamId: string, questions: MegaQuestion[]) {
  return questions.filter((question) => question.prompt.trim().length > 0 && question.winnerTeamId === teamId).length;
}

export function isMegaUnlocked(team: Team, questions: MegaQuestion[]) {
  return supportsMegaEvolution(team.mascot) && getMegaWinsForTeam(team.id, questions) > 0;
}

export function isMegaReady(team: Team, questions: MegaQuestion[]) {
  return isMegaUnlocked(team, questions) && team.unlockedLevel >= getEvolutionStageCount(team.mascot) && !team.megaActive;
}

export function resolveTeamVisual(team: Team) {
  const baseStage = getEvolutionStage(team.mascot, team.displayLevel);
  const megaStage = team.megaActive ? resolveMegaStage(team.mascot, team.megaVariant) : null;
  const stage = megaStage ?? baseStage;

  return {
    stage,
    baseStage,
    megaStage,
    isMega: Boolean(megaStage),
    stageCount: getEvolutionStageCount(team.mascot),
  };
}

export function hasMegaTeams(teams: Array<{ mascot: MascotFamily }>) {
  return teams.some((team) => supportsMegaEvolution(team.mascot));
}
