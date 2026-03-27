"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { MascotAvatar } from "@/components/game/mascot-avatar";
import { DEFAULT_TEAM_NAMES, MASCOT_FAMILIES, TEAM_LIMITS } from "@/lib/constants";
import { createDefaultTeamSeeds } from "@/lib/game-logic";
import { useClassroomSync } from "@/hooks/use-classroom-sync";
import { fetchPokemonCatalog } from "@/lib/pokeapi";
import { supportsMegaEvolution } from "@/lib/pokemon-helpers";
import type { MascotFamily, MegaVariant, TeamSeed } from "@/lib/types";
import { cn, createId } from "@/lib/utils";
import { useClassroomStore } from "@/store/use-classroom-store";

type EditableTeam = TeamSeed & {
  id: string;
  megaVariant: MegaVariant | null;
};

function getDefaultMegaVariant(family: MascotFamily) {
  return family.megaForms?.find((stage) => stage.variant)?.variant ?? null;
}

function MegaWatermark({
  animated = true,
  className,
  imageClassName,
  src = "/assets/mega.png",
  visible,
}: {
  animated?: boolean;
  className?: string;
  imageClassName?: string;
  src?: string;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "mega-watermark pointer-events-none absolute overflow-hidden transition-opacity duration-200",
        visible ? (animated ? "mega-watermark--visible opacity-80" : "opacity-80") : "opacity-0",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        draggable={false}
        className={cn(
          "mega-watermark__image select-none object-contain object-center contrast-125 saturate-125 brightness-110 [transform:scale(1.7)]",
          imageClassName,
        )}
      />
    </div>
  );
}

function SetupTeamCard({
  team,
  familyOptions,
  onNameChange,
  onFamilyChange,
  onMegaVariantChange,
}: {
  team: EditableTeam;
  familyOptions: MascotFamily[];
  onNameChange: (value: string) => void;
  onFamilyChange: (value: MascotFamily) => void;
  onMegaVariantChange: (value: MegaVariant | null) => void;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const family = team.mascot;
  const filteredFamilies = useMemo(() => {
    const keyword = deferredQuery.trim().toLocaleLowerCase("vi");

    if (!keyword) {
      return familyOptions;
    }

    return familyOptions.filter((option) =>
      [option.name, option.description, ...option.evolutionChain.map((stage) => stage.name)]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword),
    );
  }, [deferredQuery, familyOptions]);
  const canMega = supportsMegaEvolution(family);
  const megaChoices = family.megaForms?.filter((stage) => stage.variant) ?? [];

  return (
    <article
      className="arena-panel rounded-none border-2 p-4"
      style={{
        borderColor: `${family.accent}55`,
        background: `linear-gradient(180deg, ${family.secondary}66 0%, rgba(255,255,255,0.94) 34%, rgba(255,255,255,0.9) 100%)`,
      }}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(15rem,0.56fr)_minmax(0,1.44fr)]">
        <div
          className="relative overflow-hidden rounded-none border-2 border-white/80 p-4"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.82) 0%, ${family.secondary}88 100%)`,
          }}
        >
          <MegaWatermark visible={canMega} className="right-2 top-2 h-20 w-20 rotate-[9deg]" />
          <div className="kid-label">Pokémon của nhóm</div>
          <div className="relative z-10 mt-3 flex flex-col items-center text-center">
            <MascotAvatar family={team.mascot} level={1} size={224} glow className="mx-auto" />
            <div className="mt-3 font-heading text-3xl leading-none text-slate-950">
              {family.evolutionChain[0]?.name ?? family.name}
            </div>
          </div>

          <div className="relative z-10 mt-4">
            <div className="kid-label">Tên nhóm</div>
            <input
              value={team.name}
              onChange={(event) => onNameChange(event.target.value)}
              className="mt-2 w-full rounded-none border-2 border-white/90 bg-white px-3 py-2.5 text-base font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
              placeholder="Nhập tên nhóm"
            />
          </div>

          <div className="relative z-10 mt-4 min-h-[4.9rem]">
            {megaChoices.length > 1 ? (
              <>
                <div className="kid-label">Chọn dạng mega</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {megaChoices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => onMegaVariantChange(choice.variant ?? null)}
                      className={cn(
                        "rounded-none border-2 px-3 py-2.5 text-sm font-black transition",
                        team.megaVariant === choice.variant
                          ? "border-slate-900/10 bg-slate-900 text-white"
                          : "border-white/90 bg-white/85 text-slate-700",
                      )}
                    >
                      {choice.variant === "x" ? "Mega X" : "Mega Y"}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="min-w-0">
          <div className="kid-label">Pokémon đại diện</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              className="min-w-[12rem] flex-1 rounded-none border-2 border-white/90 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
              placeholder="Tìm Pikachu, Bulbasaur, Gengar..."
            />
            <div className="rounded-none border-2 border-white/90 bg-white/85 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {filteredFamilies.length} lựa chọn
            </div>
          </div>
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFamilies.map((option) => {
                const isMegaOption = supportsMegaEvolution(option);
                const isSelected = team.mascot.id === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onFamilyChange(option)}
                    className={cn(
                      "relative flex items-center gap-1.5 overflow-hidden rounded-none px-2.5 py-2 text-left outline-none transition duration-200",
                      isMegaOption ? "mega-select-card bg-white/92 text-slate-950 hover:bg-white" : "border bg-white/88 text-slate-700 hover:border-slate-200 hover:bg-white",
                      !isMegaOption &&
                        (isSelected ? "border-slate-900/10 bg-white text-slate-950 shadow-[0_10px_22px_rgba(15,23,42,0.08)]" : "border-white/90"),
                      isMegaOption && isSelected && "bg-white",
                    )}
                    style={{
                      ...(isSelected
                        ? {
                            background: `linear-gradient(180deg, rgba(255,255,255,0.98), ${option.secondary}66)`,
                            ...(isMegaOption ? null : { borderColor: `${option.accent}66` }),
                      }
                        : null),
                    }}
                  >
                    {isMegaOption ? (
                      <svg
                        className="mega-select-card__snake absolute inset-0 h-full w-full"
                        viewBox="0 0 100 52"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <rect x="0.75" y="0.75" width="98.5" height="50.5" rx="0" ry="0" pathLength="100" />
                      </svg>
                    ) : null}
                    <span className="relative z-10 h-2 w-2 shrink-0 border border-white/90 bg-red-600" />
                    <div
                      className={cn(
                        "relative z-10 flex min-h-[2.35rem] min-w-0 flex-1 items-center overflow-hidden px-2 py-1",
                        isMegaOption ? "bg-white/24" : "border border-white/70 bg-white/72",
                      )}
                    >
                      <div className="relative z-10 truncate font-heading text-base leading-none">{option.name}</div>
                    </div>
                    <span
                      className={cn(
                        "relative z-10 shrink-0 rounded-none px-2 py-0.5 text-[10px] font-bold",
                        isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {isSelected ? "Đang chọn" : "Chọn"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {filteredFamilies.length === 0 ? (
            <div className="mt-3 rounded-none border-2 border-dashed border-white/90 bg-white/70 px-4 py-3 text-sm font-medium text-slate-500">
              Chưa thấy Pokémon phù hợp. Bạn có thể thử Pikachu, Dragonite hoặc Squirtle.
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function SetupPageClient() {
  useClassroomSync();

  const teamsInStore = useClassroomStore((state) => state.teams);
  const isHydrated = useClassroomStore((state) => state.isHydrated);

  if (!isHydrated) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Đang tải trang thiết lập...</div>;
  }

  const initialTeams =
    teamsInStore.length >= TEAM_LIMITS.min
      ? teamsInStore.slice(0, TEAM_LIMITS.max).map((team) => ({
          id: team.id,
          name: team.name,
          mascot: team.mascot,
          megaVariant: team.megaVariant,
        }))
      : createDefaultTeamSeeds(TEAM_LIMITS.max).map((team) => ({
          ...team,
          megaVariant: team.megaVariant ?? getDefaultMegaVariant(team.mascot),
        }));

  return (
    <SetupEditor
      key={initialTeams.map((team) => team.id).join("|")}
      initialTeams={initialTeams}
    />
  );
}

function SetupEditor({
  initialTeams,
}: {
  initialTeams: EditableTeam[];
}) {
  const router = useRouter();
  const createSession = useClassroomStore((state) => state.createSession);
  const [selectedCount, setSelectedCount] = useState(initialTeams.length);
  const [teams, setTeams] = useState<EditableTeam[]>(initialTeams);
  const [pokemonOptions, setPokemonOptions] = useState<MascotFamily[]>(MASCOT_FAMILIES);

  const selectedTeams = useMemo(() => teams.slice(0, selectedCount), [selectedCount, teams]);
  const availableFamilies = useMemo(() => {
    const merged = new Map<string, MascotFamily>();

    pokemonOptions.forEach((family) => {
      merged.set(family.id, family);
    });
    teams.forEach((team) => {
      if (!merged.has(team.mascot.id)) {
        merged.set(team.mascot.id, team.mascot);
      }
    });

    return [...merged.values()];
  }, [pokemonOptions, teams]);

  useEffect(() => {
    let isActive = true;

    fetchPokemonCatalog()
      .then((families) => {
        if (!isActive) {
          return;
        }

        if (families.length > 0) {
          setPokemonOptions(families);
        }
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const updateTeamCount = (nextCount: number) => {
    const safeCount = Math.max(TEAM_LIMITS.min, Math.min(nextCount, TEAM_LIMITS.max));
    setSelectedCount(safeCount);
    setTeams((current) => {
      if (current.length >= safeCount) {
        return current;
      }

      const nextTeams = [...current];

      while (nextTeams.length < safeCount) {
        const nextIndex = nextTeams.length;
        const fallbackFamily =
          availableFamilies[nextIndex % availableFamilies.length] ?? MASCOT_FAMILIES[nextIndex % MASCOT_FAMILIES.length];

        nextTeams.push({
          id: createId(`seed-${nextIndex + 1}`),
          name: DEFAULT_TEAM_NAMES[nextIndex] ?? `Đội ${nextIndex + 1}`,
          mascot: fallbackFamily,
          megaVariant: getDefaultMegaVariant(fallbackFamily),
        });
      }

      return nextTeams;
    });
  };

  const updateTeam = (id: string, patch: Partial<EditableTeam>) => {
    setTeams((current) => current.map((team) => (team.id === id ? { ...team, ...patch } : team)));
  };

  const handleStart = () => {
    createSession({
      teams: selectedTeams.map((team) => ({
        id: team.id,
        name: team.name,
        mascot: team.mascot,
        megaVariant: team.megaVariant,
      })),
      questions: [],
    });
    router.push("/teacher");
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(201,31,46,0.1),transparent_14%),radial-gradient(circle_at_90%_10%,rgba(170,118,16,0.1),transparent_16%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(201,31,46,0.04)_100%)]" />
      <div className="relative mx-auto max-w-7xl">
        <section className="arena-panel relative isolate overflow-hidden rounded-none border-2 p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.12)_32%,rgba(255,255,255,0)_60%)]" />
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center justify-center lg:flex lg:w-[calc(100%-20.5rem)]">
              <div className="relative h-[22rem] w-[28rem] opacity-[0.85] xl:h-[40rem] xl:w-[50rem]">
                <Image
                  src="/assets/background.png"
                  alt=""
                  fill
                  unoptimized
                  draggable={false}
                  className="select-none object-contain object-center"
                />
              </div>
            </div>

            <div className="relative z-10 max-w-3xl">
              <div className="relative z-10 kid-chip text-sm font-bold text-red-800">Thiết lập lớp học</div>
            </div>

            <div className="relative z-10 rounded-none border border-red-900/10 bg-[linear-gradient(180deg,rgba(255,249,243,0.98)_0%,rgba(255,255,255,0.96)_100%)] p-4 shadow-[0_16px_32px_rgba(117,28,34,0.07)]">
              <div className="text-sm font-bold text-slate-500">Số đội đang chọn</div>
              <div className="mt-1.5 font-heading text-4xl text-slate-950">{selectedCount}</div>

              <div className="mt-4 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => updateTeamCount(selectedCount - 1)}
                  className="grid h-12 w-12 place-items-center rounded-none border border-slate-200 bg-white text-xl font-black text-slate-900 shadow-[0_12px_24px_rgba(12,39,77,0.08)]"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => updateTeamCount(selectedCount + 1)}
                  className="grid h-12 w-12 place-items-center rounded-none border border-red-300 bg-red-600 text-xl font-black text-white shadow-[0_12px_24px_rgba(185,28,28,0.18)]"
                >
                  +
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {Array.from({ length: TEAM_LIMITS.max - TEAM_LIMITS.min + 1 }, (_, index) => TEAM_LIMITS.min + index).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => updateTeamCount(count)}
                    className={cn(
                      "rounded-none border px-3 py-2.5 text-sm font-black transition duration-200",
                      selectedCount === count
                        ? "border-red-400 bg-red-600 text-white shadow-[0_12px_24px_rgba(185,28,28,0.18)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50",
                    )}
                  >
                    {count} đội
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleStart}
                  className="rounded-none border border-red-400 bg-red-600 px-5 py-3 font-black text-white shadow-[0_16px_32px_rgba(185,28,28,0.2)] transition hover:translate-y-[-1px]"
                >
                  Bắt đầu tiết học
                </button>
                <Link
                  href="/teacher"
                  className="rounded-none border border-slate-200 bg-white px-5 py-3 text-center font-bold text-slate-700 transition hover:border-red-200 hover:text-red-700"
                >
                  Mở bảng chấm điểm
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 space-y-4">
          {selectedTeams.map((team) => (
            <SetupTeamCard
              key={team.id}
              team={team}
              familyOptions={availableFamilies}
              onNameChange={(value) => updateTeam(team.id, { name: value })}
              onFamilyChange={(value) =>
                updateTeam(team.id, {
                  mascot: value,
                  megaVariant: getDefaultMegaVariant(value),
                })
              }
              onMegaVariantChange={(value) => updateTeam(team.id, { megaVariant: value })}
            />
          ))}
        </section>

      </div>
    </main>
  );
}
