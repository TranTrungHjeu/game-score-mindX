"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { MascotAvatar } from "@/components/game/mascot-avatar";
import { DEFAULT_TEAM_NAMES, MASCOT_FAMILIES, TEAM_LIMITS, getEvolutionStageCount } from "@/lib/constants";
import { createDefaultTeamSeeds, getThresholdForLevel } from "@/lib/game-logic";
import { useClassroomSync } from "@/hooks/use-classroom-sync";
import { fetchPokemonCatalog } from "@/lib/pokeapi";
import type { MascotFamily, TeamSeed } from "@/lib/types";
import { cn, createId } from "@/lib/utils";
import { useClassroomStore } from "@/store/use-classroom-store";

type EditableTeam = TeamSeed & {
  id: string;
};

function SetupTeamCard({
  team,
  familyOptions,
  onNameChange,
  onFamilyChange,
}: {
  team: EditableTeam;
  familyOptions: MascotFamily[];
  onNameChange: (value: string) => void;
  onFamilyChange: (value: MascotFamily) => void;
}) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const family = team.mascot;
  const stageCount = getEvolutionStageCount(team.mascot);
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
  const visibleFamilies = showAll || filteredFamilies.length <= 6 ? filteredFamilies : filteredFamilies.slice(0, 6);
  const hiddenCount = Math.max(0, filteredFamilies.length - visibleFamilies.length);

  return (
    <article
      className="arena-panel rounded-[2rem] border-2 p-5"
      style={{
        borderColor: `${family.accent}55`,
        background: `linear-gradient(180deg, ${family.secondary}66 0%, rgba(255,255,255,0.94) 34%, rgba(255,255,255,0.9) 100%)`,
      }}
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-1 items-center gap-4">
          <MascotAvatar family={team.mascot} level={1} size={132} />
          <div className="flex-1">
            <div className="kid-label">Tên nhóm</div>
            <input
              value={team.name}
              onChange={(event) => onNameChange(event.target.value)}
              className="mt-2 w-full rounded-[1.6rem] border-2 border-white/90 bg-white px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              placeholder="Nhập tên nhóm"
            />
          </div>
        </div>

        <div className="flex-[1.2]">
          <div className="kid-label">Pokémon đại diện</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowAll(false);
              }}
              className="min-w-[14rem] flex-1 rounded-[1.4rem] border-2 border-white/90 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              placeholder="Tìm Pikachu, Bulbasaur, Gengar..."
            />
            <div className="rounded-full border-2 border-white/90 bg-white/85 px-4 py-2 text-sm font-bold text-slate-600">
              {filteredFamilies.length} lựa chọn
            </div>
          </div>
          <div className="themed-scrollbar mt-3 max-h-[20rem] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {visibleFamilies.map((family) => (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => onFamilyChange(family)}
                  className={cn(
                    "rounded-[1.6rem] border-2 px-3 py-3 text-left transition duration-200",
                    team.mascot.id === family.id
                      ? "translate-y-[-2px] text-slate-950 shadow-[0_16px_32px_rgba(56,189,248,0.18)]"
                      : "border-white/90 bg-white/90 text-slate-700 hover:translate-y-[-2px] hover:border-cyan-200 hover:bg-cyan-50",
                  )}
                  style={
                    team.mascot.id === family.id
                      ? {
                          borderColor: `${family.accent}88`,
                          background: `linear-gradient(135deg, ${family.secondary}, white)`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-white/80"
                      style={{ backgroundColor: family.accent }}
                    />
                    <div className="font-heading text-lg">{family.name}</div>
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {family.evolutionChain.length} giai đoạn
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    {family.evolutionChain.map((stage) => stage.name).join(" → ")}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {filteredFamilies.length === 0 ? (
            <div className="mt-3 rounded-[1.4rem] border-2 border-dashed border-white/90 bg-white/70 px-4 py-3 text-sm font-medium text-slate-500">
              Chưa thấy Pokémon phù hợp. Bạn có thể thử Pikachu, Dragonite hoặc Squirtle.
            </div>
          ) : null}
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 rounded-full border-2 border-white/90 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-600"
            >
              Xem thêm {hiddenCount} lựa chọn
            </button>
          ) : null}
          {showAll && filteredFamilies.length > 6 ? (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="mt-3 ml-3 rounded-full border-2 border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-slate-500 transition hover:text-slate-700"
            >
              Thu gọn
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <div className="kid-label">Các mốc tiến hóa</div>
        <div
          className="mt-3 grid gap-4 rounded-[1.6rem] px-4 py-4 lg:grid-cols-[10rem_1fr]"
          style={{
            background: `linear-gradient(135deg, ${family.accent}18, #ffffff 38%, ${family.secondary}55 100%)`,
          }}
        >
          <div className="flex items-center justify-center">
            <MascotAvatar family={team.mascot} level={stageCount} size={132} glow />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {family.evolutionChain.map((stage, index) => {
              const level = index + 1;
              const threshold = getThresholdForLevel(level);
              const thresholdLabel = index === stageCount - 1 ? `${threshold}+ điểm` : `${threshold} điểm`;

              return (
                <div
                  key={`${team.id}-level-${level}`}
                  className="rounded-[1.35rem] border-2 border-white/85 bg-white/85 px-4 py-3 text-slate-800"
                >
                  <div className="text-sm font-black text-sky-700">Giai đoạn {level}</div>
                  <div className="mt-2 font-heading text-2xl leading-none text-slate-900">{stage.name}</div>
                  <div className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                    {thresholdLabel}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">{stage.summary}</div>
                </div>
              );
            })}
          </div>
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
      ? teamsInStore.map((team) => ({
          id: team.id,
          name: team.name,
          mascot: team.mascot,
        }))
      : createDefaultTeamSeeds(4);

  return (
    <SetupEditor
      key={initialTeams.map((team) => team.id).join("|")}
      initialTeams={initialTeams}
    />
  );
}

function SetupEditor({ initialTeams }: { initialTeams: EditableTeam[] }) {
  const router = useRouter();
  const createSession = useClassroomStore((state) => state.createSession);
  const [selectedCount, setSelectedCount] = useState(initialTeams.length);
  const [teams, setTeams] = useState<EditableTeam[]>(initialTeams);
  const [pokemonOptions, setPokemonOptions] = useState<MascotFamily[]>(MASCOT_FAMILIES);
  const [catalogStatus, setCatalogStatus] = useState<"loading" | "ready" | "error">("loading");

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

        setCatalogStatus("ready");
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setCatalogStatus("error");
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
      })),
    });
    router.push("/teacher");
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_14%,rgba(255,196,102,0.28),transparent_14%),radial-gradient(circle_at_92%_10%,rgba(76,201,240,0.26),transparent_16%),radial-gradient(circle_at_18%_88%,rgba(255,153,200,0.18),transparent_18%)]" />
      <div className="relative mx-auto max-w-7xl">
        <section className="arena-panel rounded-[2.6rem] border-2 p-6 sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
              <div className="rounded-[2rem] border-2 border-white/80 bg-white/55 p-5 sm:p-6">
                <div className="kid-chip text-sm font-bold text-sky-700">Thiết lập lớp học</div>
                <h1 className="mt-4 font-heading text-4xl leading-tight text-slate-900 sm:text-5xl">
                  Chọn số đội và Pokémon đại diện cho từng nhóm
                </h1>
                <p className="kid-subtle mt-3 max-w-2xl text-base leading-7">
                  Thiết lập nhanh để cô, thầy vào tiết học ngay mà không phải chỉnh quá nhiều.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateTeamCount(selectedCount - 1)}
                    className="grid h-14 w-14 place-items-center rounded-[1.5rem] border-2 border-slate-200 bg-white text-2xl font-black text-slate-900 shadow-[0_14px_28px_rgba(97,117,143,0.14)]"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTeamCount(selectedCount + 1)}
                    className="grid h-14 w-14 place-items-center rounded-[1.5rem] border-2 border-cyan-300 bg-cyan-400 text-2xl font-black text-white shadow-[0_14px_28px_rgba(34,211,238,0.28)]"
                  >
                    +
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {Array.from({ length: TEAM_LIMITS.max - TEAM_LIMITS.min + 1 }, (_, index) => TEAM_LIMITS.min + index).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateTeamCount(count)}
                      className={cn(
                        "rounded-[1.4rem] border-2 px-4 py-3 text-base font-black transition duration-200",
                        selectedCount === count
                          ? "border-cyan-300 bg-cyan-400 text-white shadow-[0_16px_28px_rgba(34,211,238,0.26)]"
                          : "border-white/90 bg-white/88 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50",
                      )}
                    >
                      {count} đội
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="rounded-full border-2 border-cyan-300 bg-cyan-400 px-7 py-4 font-black text-white shadow-[0_20px_40px_rgba(14,165,233,0.28)] transition hover:translate-y-[-1px]"
                  >
                    Bắt đầu tiết học
                  </button>
                  <Link
                    href="/teacher"
                    className="rounded-full border-2 border-white/90 bg-white px-6 py-4 font-bold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-600"
                  >
                    Mở bảng chấm điểm
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[2rem] border-2 border-white/90 bg-white/85 px-5 py-4 shadow-[0_18px_36px_rgba(97,117,143,0.12)]">
                  <div className="text-sm font-bold text-slate-500">Số đội trong lớp</div>
                  <div className="mt-1 font-heading text-4xl text-slate-950">{selectedCount} đội</div>
                  <div className="mt-2 text-sm text-slate-500">Bạn có thể tạo từ 2 đến 6 đội cho một buổi học.</div>
                </div>

                <div className="rounded-[2rem] border-2 border-white/90 bg-white/85 px-5 py-4 shadow-[0_18px_36px_rgba(97,117,143,0.12)]">
                  <div className="text-sm font-bold text-slate-500">Danh sách Pokémon</div>
                  <div className="mt-1 font-heading text-4xl text-slate-950">{availableFamilies.length} lựa chọn</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {catalogStatus === "loading" && "Đang tải thêm Pokémon từ PokeAPI..."}
                    {catalogStatus === "ready" && "Đã tải thêm nhiều Pokémon quen thuộc cho lớp."}
                    {catalogStatus === "error" && "Tạm thời chưa tải thêm được, đang dùng danh sách có sẵn."}
                  </div>
                </div>

                <div className="rounded-[2rem] border-2 border-white/90 bg-[linear-gradient(135deg,rgba(255,245,202,0.95),rgba(255,255,255,0.9),rgba(217,244,255,0.95))] px-5 py-4 shadow-[0_18px_36px_rgba(97,117,143,0.12)] sm:col-span-2 xl:col-span-1">
                  <div className="kid-label text-sky-700">Gợi ý nhanh</div>
                  <div className="mt-2 font-heading text-3xl text-slate-950">Chuẩn bị trong một khung nhìn</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Chọn số đội trước, rồi đặt tên và chọn Pokémon đại diện cho từng nhóm ngay bên dưới.
                  </p>
                </div>
              </div>
            </div>
        </section>

        <section className="mt-8 space-y-5">
          {selectedTeams.map((team) => (
            <SetupTeamCard
              key={team.id}
              team={team}
              familyOptions={availableFamilies}
              onNameChange={(value) => updateTeam(team.id, { name: value })}
              onFamilyChange={(value) => updateTeam(team.id, { mascot: value })}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
