import type { MascotFamily, Mission } from "@/lib/types";

export const STORAGE_KEY = "robotics-evolution-arena:v1";
export const CHANNEL_NAME = "robotics-evolution-arena";
export const TEAM_LIMITS = {
  min: 2,
  max: 6,
} as const;

function buildArtworkPath(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function buildAnimatedPath(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}

export const MASCOT_FAMILIES: MascotFamily[] = [
  {
    id: "species-1",
    name: "Bulbasaur",
    accent: "#54c59f",
    secondary: "#d2ffe6",
    description: "Bulbasaur -> Ivysaur -> Venusaur. Hệ cỏ độc, cân bằng và dễ nhận diện.",
    source: { speciesId: 1, evolutionChainId: 1 },
    evolutionChain: [
      {
        id: 1,
        name: "Bulbasaur",
        artworkPath: buildArtworkPath(1),
        animatedPath: buildAnimatedPath(1),
        summary: "Bulbasaur là chặng mở đầu xanh mát, nhỏ nhắn và rất dễ mến.",
      },
      {
        id: 2,
        name: "Ivysaur",
        artworkPath: buildArtworkPath(2),
        animatedPath: buildAnimatedPath(2),
        summary: "Ivysaur trông cứng cáp hơn, cho cảm giác cả đội vừa vượt qua một mốc mới.",
      },
      {
        id: 3,
        name: "Venusaur",
        artworkPath: buildArtworkPath(3),
        animatedPath: buildAnimatedPath(3),
        summary: "Venusaur to lớn, nổi bật và rất hợp cho lúc đội bứt lên.",
      },
    ],
  },
  {
    id: "species-4",
    name: "Charmander",
    accent: "#ff8b54",
    secondary: "#ffe1bf",
    description: "Charmander -> Charmeleon -> Charizard. Hệ lửa nổi bật và rất hợp để tạo cao trào.",
    source: { speciesId: 4, evolutionChainId: 2 },
    evolutionChain: [
      {
        id: 4,
        name: "Charmander",
        artworkPath: buildArtworkPath(4),
        animatedPath: buildAnimatedPath(4),
        summary: "Charmander mở đầu vui nhộn với chiếc đuôi lửa rất dễ nhận ra.",
      },
      {
        id: 5,
        name: "Charmeleon",
        artworkPath: buildArtworkPath(5),
        animatedPath: buildAnimatedPath(5),
        summary: "Charmeleon trông lì lợm hơn, báo hiệu đội đang tăng tốc rõ rệt.",
      },
      {
        id: 6,
        name: "Charizard",
        artworkPath: buildArtworkPath(6),
        animatedPath: buildAnimatedPath(6),
        summary: "Charizard xuất hiện đầy uy lực, rất bắt mắt trên màn hình lớn.",
      },
    ],
  },
  {
    id: "species-7",
    name: "Squirtle",
    accent: "#58baff",
    secondary: "#d7f2ff",
    description: "Squirtle -> Wartortle -> Blastoise. Hệ nước vui nhộn, tiến hóa rõ ràng.",
    source: { speciesId: 7, evolutionChainId: 3 },
    evolutionChain: [
      {
        id: 7,
        name: "Squirtle",
        artworkPath: buildArtworkPath(7),
        animatedPath: buildAnimatedPath(7),
        summary: "Squirtle vui nhộn và thân thiện, rất hợp cho chặng khởi đầu.",
      },
      {
        id: 8,
        name: "Wartortle",
        artworkPath: buildArtworkPath(8),
        animatedPath: buildAnimatedPath(8),
        summary: "Wartortle cho thấy đội vừa lên một nấc mới, nhìn là thấy khác ngay.",
      },
      {
        id: 9,
        name: "Blastoise",
        artworkPath: buildArtworkPath(9),
        animatedPath: buildAnimatedPath(9),
        summary: "Blastoise là dạng cuối chắc khỏe và cực kỳ nổi bật khi trình chiếu.",
      },
    ],
  },
  {
    id: "species-172",
    name: "Pichu",
    accent: "#ffd44c",
    secondary: "#fff2b8",
    description: "Pichu -> Pikachu -> Raichu. Hệ điện quen thuộc, tạo hứng thú ngay từ cái nhìn đầu tiên.",
    source: { speciesId: 172, evolutionChainId: 10 },
    evolutionChain: [
      {
        id: 172,
        name: "Pichu",
        artworkPath: buildArtworkPath(172),
        animatedPath: buildAnimatedPath(172),
        summary: "Pichu nhỏ xíu, lanh lợi và tạo cảm giác khởi đầu rất đáng yêu.",
      },
      {
        id: 25,
        name: "Pikachu",
        artworkPath: buildArtworkPath(25),
        animatedPath: buildAnimatedPath(25),
        summary: "Pikachu quá quen thuộc nên chỉ cần xuất hiện là cả lớp nhận ra ngay.",
      },
      {
        id: 26,
        name: "Raichu",
        artworkPath: buildArtworkPath(26),
        animatedPath: buildAnimatedPath(26),
        summary: "Raichu mang cảm giác bùng nổ hơn hẳn, rất hợp cho giai đoạn cuối.",
      },
    ],
  },
  {
    id: "species-92",
    name: "Gastly",
    accent: "#9a7cff",
    secondary: "#ead8ff",
    description: "Gastly -> Haunter -> Gengar. Hệ ma quái rất hợp với hiệu ứng tiến hóa.",
    source: { speciesId: 92, evolutionChainId: 40 },
    evolutionChain: [
      {
        id: 92,
        name: "Gastly",
        artworkPath: buildArtworkPath(92),
        animatedPath: buildAnimatedPath(92),
        summary: "Gastly mang vẻ tinh nghịch, hơi bí ẩn nhưng vẫn rất cuốn hút.",
      },
      {
        id: 93,
        name: "Haunter",
        artworkPath: buildArtworkPath(93),
        animatedPath: buildAnimatedPath(93),
        summary: "Haunter nghịch ngợm hơn, cho thấy đội đã bước sang một mốc mới.",
      },
      {
        id: 94,
        name: "Gengar",
        artworkPath: buildArtworkPath(94),
        animatedPath: buildAnimatedPath(94),
        summary: "Gengar trông nổi bật và có chút láu lỉnh, rất hợp cho màn về đích.",
      },
    ],
  },
  {
    id: "species-147",
    name: "Dratini",
    accent: "#67d0ff",
    secondary: "#d7f6ff",
    description: "Dratini -> Dragonair -> Dragonite. Chuỗi rồng tăng tiến rất rõ và dễ tạo cao trào.",
    source: { speciesId: 147, evolutionChainId: 76 },
    evolutionChain: [
      {
        id: 147,
        name: "Dratini",
        artworkPath: buildArtworkPath(147),
        animatedPath: buildAnimatedPath(147),
        summary: "Dratini mềm mại và sáng sủa, mở đầu cho một chuỗi tiến hóa rất đẹp mắt.",
      },
      {
        id: 148,
        name: "Dragonair",
        artworkPath: buildArtworkPath(148),
        animatedPath: buildAnimatedPath(148),
        summary: "Dragonair khiến cả chuỗi trông nâng cấp rõ rệt nhưng vẫn rất thanh thoát.",
      },
      {
        id: 149,
        name: "Dragonite",
        artworkPath: buildArtworkPath(149),
        animatedPath: buildAnimatedPath(149),
        summary: "Dragonite vừa thân thiện vừa mạnh mẽ, rất hợp cho chặng cuối cùng.",
      },
    ],
  },
];

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: "assemble",
    title: "Lắp ráp robot",
    icon: "🧩",
    suggestedPoints: 10,
    status: "active",
  },
  {
    id: "wiring",
    title: "Kéo dây đúng",
    icon: "🔌",
    suggestedPoints: 5,
    status: "idle",
  },
  {
    id: "coding",
    title: "Lập trình cơ bản",
    icon: "💻",
    suggestedPoints: 10,
    status: "idle",
  },
  {
    id: "teamwork",
    title: "Làm việc nhóm",
    icon: "🤝",
    suggestedPoints: 5,
    status: "idle",
  },
];

export const DEFAULT_TEAM_NAMES = [
  "Đội Sao Băng",
  "Đội Turbo",
  "Đội Sấm Sét",
  "Đội Siêu Tốc",
  "Đội Cầu Vồng",
  "Đội Khám Phá",
];

export function getFamilyById(id: string) {
  return MASCOT_FAMILIES.find((item) => item.id === id) ?? MASCOT_FAMILIES[0];
}

export function getEvolutionStage(family: MascotFamily, level: number) {
  const safeIndex = Math.max(0, Math.min(level - 1, family.evolutionChain.length - 1));
  return family.evolutionChain[safeIndex] ?? family.evolutionChain[0];
}

export function getEvolutionStageCount(family: MascotFamily) {
  return family.evolutionChain.length;
}
