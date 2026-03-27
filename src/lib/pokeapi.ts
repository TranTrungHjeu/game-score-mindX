import { buildAnimatedPath, buildArtworkPath, withMegaForms } from "@/lib/pokemon-helpers";
import type { MascotFamily } from "@/lib/types";

type PokeApiSpecies = {
  id: number;
  name: string;
  color: {
    name: string;
  };
  evolution_chain: {
    url: string;
  };
};

type PokeApiEvolutionNode = {
  species: {
    name: string;
    url: string;
  };
  evolves_to: PokeApiEvolutionNode[];
};

type PokeApiEvolutionChain = {
  id: number;
  chain: PokeApiEvolutionNode;
};

const FEATURED_SPECIES_IDS = [1, 4, 7, 10, 16, 25, 35, 37, 52, 60, 63, 66, 74, 92, 129, 147, 152, 172, 175, 179] as const;

const COLOR_PALETTE: Record<string, { accent: string; secondary: string }> = {
  green: { accent: "#54c59f", secondary: "#d2ffe6" },
  red: { accent: "#ff8b54", secondary: "#ffe1bf" },
  blue: { accent: "#58baff", secondary: "#d7f2ff" },
  yellow: { accent: "#ffd44c", secondary: "#fff2b8" },
  purple: { accent: "#9a7cff", secondary: "#ead8ff" },
  pink: { accent: "#ff8cc7", secondary: "#ffe0f2" },
  brown: { accent: "#d89b63", secondary: "#f8e2c8" },
  gray: { accent: "#94a3b8", secondary: "#edf2f7" },
  white: { accent: "#8ecae6", secondary: "#f8fbff" },
  black: { accent: "#64748b", secondary: "#e2e8f0" },
};

function formatPokemonName(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSpeciesIdFromUrl(url: string) {
  const matched = url.match(/\/(\d+)\/?$/);
  return matched ? Number(matched[1]) : 0;
}

function flattenEvolutionChain(node: PokeApiEvolutionNode): Array<{ id: number; name: string }> {
  const current = {
    id: getSpeciesIdFromUrl(node.species.url),
    name: formatPokemonName(node.species.name),
  };

  if (!node.evolves_to.length) {
    return [current];
  }

  // For the featured catalog we intentionally pick linear chains that are kid-friendly and easy to understand.
  return [current, ...flattenEvolutionChain(node.evolves_to[0]!)];
}

function getStageSummary(stageName: string, index: number, total: number) {
  if (index === 0) {
    return `${stageName} là chặng mở đầu, nhỏ nhắn và rất dễ khiến các em thích ngay.`;
  }

  if (index === total - 1) {
    return `${stageName} là dạng cuối, nổi bật hẳn lên và rất bắt mắt trên màn hình lớp.`;
  }

  return `${stageName} cho thấy đội vừa bước sang một mốc mới, nhìn là thấy mạnh lên ngay.`;
}

let catalogPromise: Promise<MascotFamily[]> | null = null;

async function fetchJson<T>(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchPokemonFamilyBySpeciesId(speciesId: number): Promise<MascotFamily> {
  const species = await fetchJson<PokeApiSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`);
  const evolutionChain = await fetchJson<PokeApiEvolutionChain>(species.evolution_chain.url);
  const palette = COLOR_PALETTE[species.color.name] ?? COLOR_PALETTE.blue;
  const stages = flattenEvolutionChain(evolutionChain.chain).slice(0, 3);
  const names = stages.map((stage) => stage.name).join(" -> ");
  const baseName = stages[0]?.name ?? formatPokemonName(species.name);

  return withMegaForms({
    id: `species-${species.id}`,
    name: baseName,
    accent: palette.accent,
    secondary: palette.secondary,
    description: `${names}. Chuỗi tiến hóa quen thuộc, dễ theo dõi trong giờ học.`,
    source: {
      speciesId: species.id,
      evolutionChainId: evolutionChain.id,
    },
    evolutionChain: stages.map((stage, index) => ({
      id: stage.id,
      name: stage.name,
      artworkPath: buildArtworkPath(stage.id),
      animatedPath: buildAnimatedPath(stage.id),
      summary: getStageSummary(stage.name, index, stages.length),
    })),
  });
}

export async function fetchPokemonCatalog() {
  if (!catalogPromise) {
    catalogPromise = Promise.allSettled(
      FEATURED_SPECIES_IDS.map((speciesId) => fetchPokemonFamilyBySpeciesId(speciesId)),
    ).then((results) =>
      results
        .filter((result): result is PromiseFulfilledResult<MascotFamily> => result.status === "fulfilled")
        .map((result) => result.value)
        .filter((family) => family.evolutionChain.length > 0),
    );
  }

  return catalogPromise;
}
