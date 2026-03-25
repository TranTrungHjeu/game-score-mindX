"use client";

import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

import { EvolutionOverlay } from "@/components/game/evolution-overlay";
import { MascotAvatar } from "@/components/game/mascot-avatar";
import { TeamDisplayCard } from "@/components/game/team-display-card";
import { getEvolutionStage, getEvolutionStageCount } from "@/lib/constants";
import { rankTeams } from "@/lib/game-logic";
import { useClassroomSync } from "@/hooks/use-classroom-sync";
import { cn, formatPoints } from "@/lib/utils";
import { useClassroomStore } from "@/store/use-classroom-store";

function getGridClass(teamCount: number) {
  if (teamCount >= 5) {
    return "xl:grid-cols-3";
  }

  return "lg:grid-cols-2";
}

export default function DisplayArena() {
  useClassroomSync();

  const teams = useClassroomStore((state) => state.teams);
  const overlayQueue = useClassroomStore((state) => state.overlayQueue);
  const isHydrated = useClassroomStore((state) => state.isHydrated);
  const consumeEvolution = useClassroomStore((state) => state.consumeEvolution);

  const rankedTeams = useMemo(() => rankTeams(teams), [teams]);
  const activeOverlay = overlayQueue[0] ?? null;

  if (!isHydrated) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Đang tải màn hình trình chiếu...</div>;
  }

  if (!teams.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#d8f7ff_0%,#fff9f0_42%,#fff_100%)] px-6">
        <div className="arena-panel max-w-2xl rounded-[2.4rem] p-8 text-center">
          <div className="font-heading text-5xl text-slate-950">Chưa có bảng điểm để hiển thị.</div>
          <p className="mt-4 text-lg leading-8 text-slate-600">Hãy tạo đội ở phần thiết lập rồi mở bảng điều khiển để bắt đầu.</p>
          <Link href="/setup" className="mt-8 inline-flex rounded-full bg-cyan-500 px-7 py-4 font-black text-white">
            Đi đến thiết lập
          </Link>
        </div>
      </main>
    );
  }

  const leader = rankedTeams[0] ?? null;
  const podiumTeams = rankedTeams.slice(0, 3);
  const leaderStage = leader ? getEvolutionStage(leader.mascot, leader.displayLevel) : null;
  const leaderStageCount = leader ? getEvolutionStageCount(leader.mascot) : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#0e2853_0%,#1e4c88_42%,#59b9ff_100%)] px-5 py-5 text-slate-900 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(255,255,255,0.3),transparent_16%),radial-gradient(circle_at_82%_12%,rgba(255,214,120,0.18),transparent_16%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.2),transparent_28%)]" />
      <div className="display-stage__rings pointer-events-none absolute inset-x-0 top-[-8rem] h-[32rem]" />
      <div className="display-stage__floor pointer-events-none absolute inset-x-0 bottom-[-6rem] h-[22rem]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1600px] flex-col">
        <section className="display-stage relative overflow-hidden rounded-[2.5rem] px-5 py-6 text-white shadow-[0_32px_80px_rgba(7,18,40,0.36)] sm:px-8 sm:py-8">
          <div className="display-stage__glow absolute left-1/2 top-[-4rem] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full" />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:items-center">
            <div>
              <div className="kid-chip border-white/20 bg-white/12 text-sm font-bold text-cyan-100 shadow-none">Đấu trường Pokémon</div>
              <h1 className="mt-4 font-heading text-4xl leading-tight text-white sm:text-6xl">
                Bảng xếp hạng trực tiếp của cả lớp
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Mỗi lần cộng điểm là một bước tiến hóa mới. Cả lớp chỉ cần nhìn lên màn hình là biết đội nào đang bứt lên.
              </p>

              {leader && leaderStage ? (
                <div className="mt-6 grid gap-5 rounded-[2rem] border border-white/18 bg-white/10 p-5 backdrop-blur-md sm:grid-cols-[15rem_1fr] sm:items-center">
                  <div className="flex justify-center sm:justify-start">
                    <MascotAvatar family={leader.mascot} level={leader.displayLevel} size={220} glow />
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.12em] text-cyan-100/75">Đội đang dẫn đầu</div>
                    <div className="mt-2 font-heading text-4xl leading-none text-white sm:text-5xl">{leader.name}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-black text-white">
                        {formatPoints(leader.score)}
                      </div>
                      <div className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-black text-cyan-100">
                        {leaderStage.name}
                      </div>
                      <div className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-black text-cyan-100">
                        Giai đoạn {leader.displayLevel}/{leaderStageCount}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="rounded-[2rem] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <div className="text-sm font-black uppercase tracking-[0.12em] text-cyan-100/80">Top hiện tại</div>
              <div className="mt-4 space-y-3">
                {podiumTeams.map((team, index) => (
                  <div
                    key={team.id}
                    className={cn(
                      "flex items-center gap-4 rounded-[1.5rem] border px-4 py-3",
                      index === 0 ? "border-amber-200/30 bg-white/16" : "border-white/14 bg-white/8",
                    )}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-950/45 text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-heading text-2xl leading-none text-white">{team.name}</div>
                      <div className="mt-1 text-sm text-white/68">
                        {getEvolutionStage(team.mascot, team.displayLevel).name}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/16 bg-white/12 px-3 py-2 text-sm font-black text-white">
                      {formatPoints(team.score)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.4rem] border border-white/16 bg-white/8 px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-white/58">Số đội</div>
                  <div className="mt-2 font-heading text-3xl text-white">{teams.length}</div>
                </div>
                <div className="rounded-[1.4rem] border border-white/16 bg-white/8 px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-white/58">Trạng thái</div>
                  <div className="mt-2 font-heading text-3xl text-white">{activeOverlay ? "Tiến hóa" : "Thi đấu"}</div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className={`mt-6 mb-5 grid flex-1 gap-4 ${getGridClass(teams.length)}`}>
          {rankedTeams.map((team, index) => (
            <TeamDisplayCard
              key={team.id}
              team={team}
              rank={index + 1}
              isLeader={index === 0}
              featured={index === 0}
              className={index === 0 && teams.length > 1 ? "lg:col-span-2" : undefined}
            />
          ))}
        </section>
      </div>

      <AnimatePresence>
        {activeOverlay ? (
          <EvolutionOverlay
            overlay={activeOverlay}
            onComplete={() => consumeEvolution(activeOverlay.id, activeOverlay.teamId, activeOverlay.toLevel)}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
