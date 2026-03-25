"use client";

import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

import { EvolutionOverlay } from "@/components/game/evolution-overlay";
import { TeamDisplayCard } from "@/components/game/team-display-card";
import { rankTeams } from "@/lib/game-logic";
import { useClassroomSync } from "@/hooks/use-classroom-sync";
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#7dd3fc_0%,#c4b5fd_45%,#fde68a_100%)] px-5 py-5 text-slate-900 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.45),transparent_16%),radial-gradient(circle_at_86%_12%,rgba(255,255,255,0.38),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.3),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1600px] flex-col">
        <header className="arena-panel mb-5 rounded-[2rem] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="kid-chip text-sm font-bold text-sky-700">Màn hình lớp học</div>
              <h1 className="mt-3 font-heading text-4xl sm:text-6xl">Bảng xếp hạng của lớp</h1>
            </div>
            {leader ? (
              <div className="rounded-full border-2 border-amber-100 bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_14px_28px_rgba(251,191,36,0.25)]">
                Tạm dẫn đầu: {leader.name}
              </div>
            ) : null}
          </div>
        </header>

        <section className={`mb-5 grid flex-1 gap-4 ${getGridClass(teams.length)}`}>
          {rankedTeams.map((team, index) => (
            <TeamDisplayCard key={team.id} team={team} rank={index + 1} isLeader={index === 0} />
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
