"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { EvolutionOverlay } from "@/components/game/evolution-overlay";
import { MascotAvatar } from "@/components/game/mascot-avatar";
import { TeamDisplayCard } from "@/components/game/team-display-card";
import { getEvolutionStage } from "@/lib/constants";
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

type RankBurst = {
  id: string;
  teamId: string;
  teamName: string;
  fromRank: number;
  toRank: number;
  accentColor: string;
};

export default function DisplayArena() {
  useClassroomSync();

  const teams = useClassroomStore((state) => state.teams);
  const overlayQueue = useClassroomStore((state) => state.overlayQueue);
  const isHydrated = useClassroomStore((state) => state.isHydrated);
  const consumeEvolution = useClassroomStore((state) => state.consumeEvolution);

  const rankedTeams = useMemo(() => rankTeams(teams), [teams]);
  const activeOverlay = overlayQueue[0] ?? null;
  const previousRanksRef = useRef<Map<string, number>>(new Map());
  const isMountedRef = useRef(false);
  const [rankBursts, setRankBursts] = useState<RankBurst[]>([]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!rankedTeams.length) {
      previousRanksRef.current = new Map();
      return;
    }

    const nextRanks = new Map(rankedTeams.map((team, index) => [team.id, index + 1]));
    const previousRanks = previousRanksRef.current;

    if (!previousRanks.size) {
      previousRanksRef.current = nextRanks;
      return;
    }

    const freshBursts = rankedTeams.flatMap((team, index) => {
      const toRank = index + 1;
      const fromRank = previousRanks.get(team.id);

      if (typeof fromRank !== "number" || fromRank <= toRank) {
        return [];
      }

      return [
        {
          id: `${team.id}-${team.score}-${toRank}`,
          teamId: team.id,
          teamName: team.name,
          fromRank,
          toRank,
          accentColor: team.accentColor,
        },
      ];
    });

    if (freshBursts.length) {
      setRankBursts((current) => [...current, ...freshBursts].slice(-3));

      freshBursts.forEach((burst) => {
        window.setTimeout(() => {
          if (!isMountedRef.current) {
            return;
          }

          setRankBursts((current) => current.filter((item) => item.id !== burst.id));
        }, 2400);
      });
    }

    previousRanksRef.current = nextRanks;
  }, [rankedTeams]);

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

  const podiumSlots = [
    { team: rankedTeams[1] ?? null, rank: 2, pedestalHeight: 128, accent: "#dbeafe" },
    { team: rankedTeams[0] ?? null, rank: 1, pedestalHeight: 176, accent: "#fde68a" },
    { team: rankedTeams[2] ?? null, rank: 3, pedestalHeight: 108, accent: "#fbcfe8" },
  ] as const;
  const leader = rankedTeams[0] ?? null;
  const runnerUp = rankedTeams[1] ?? null;
  const leaderStage = leader ? getEvolutionStage(leader.mascot, leader.displayLevel) : null;
  const leaderGap = leader && runnerUp ? leader.score - runnerUp.score : null;
  const latestBurst = rankBursts[rankBursts.length - 1] ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#0e2853_0%,#1e4c88_42%,#59b9ff_100%)] px-5 py-5 text-slate-900 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(255,255,255,0.3),transparent_16%),radial-gradient(circle_at_82%_12%,rgba(255,214,120,0.18),transparent_16%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.2),transparent_28%)]" />
      <div className="display-stage__rings pointer-events-none absolute inset-x-0 top-[-8rem] h-[32rem]" />
      <div className="display-stage__floor pointer-events-none absolute inset-x-0 bottom-[-6rem] h-[22rem]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1600px] flex-col">
        <section className="display-stage relative overflow-hidden rounded-[2.5rem] px-5 py-6 text-white shadow-[0_32px_80px_rgba(7,18,40,0.36)] sm:px-8 sm:py-8">
          <div className="display-stage__glow absolute left-1/2 top-[-4rem] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full" />
          <div className="display-stage__spotlights pointer-events-none absolute inset-0" />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] xl:items-start">
            <div>
              <div className="kid-chip border-white/20 bg-white/12 text-sm font-bold text-cyan-100 shadow-none">Đấu trường Pokémon</div>
              <h1 className="mt-4 font-heading text-4xl leading-tight text-white sm:text-6xl">
                Bảng xếp hạng trực tiếp của cả lớp
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Mỗi lần cộng điểm là một bước tiến hóa mới. Cả lớp chỉ cần nhìn lên màn hình là biết đội nào đang bứt lên.
              </p>

              <div className="display-stage__ticker mt-6">
                <div className="display-stage__ticker-card">
                  <div className="display-stage__ticker-label">Đội đang dẫn đầu</div>
                  <div className="mt-3 font-heading text-2xl text-white sm:text-3xl">{leader?.name ?? "Sẵn sàng thi đấu"}</div>
                  <div className="mt-1 text-sm text-white/70">{leaderStage ? `${leaderStage.name} · ${formatPoints(leader.score)}` : "Bắt đầu cộng điểm để chọn đội dẫn đầu."}</div>
                </div>
                <div className="display-stage__ticker-card">
                  <div className="display-stage__ticker-label">Khoảng cách hiện tại</div>
                  <div className="mt-3 font-heading text-2xl text-white sm:text-3xl">
                    {leaderGap === null ? "Chờ bắt đầu" : leaderGap > 0 ? formatPoints(leaderGap) : "Đang ngang điểm"}
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    {runnerUp ? `So với đội #2 là ${runnerUp.name}` : "Cần ít nhất 2 đội để so khoảng cách."}
                  </div>
                </div>
                <div className="display-stage__ticker-card">
                  <div className="display-stage__ticker-label">Diễn biến mới nhất</div>
                  <div className="mt-3 font-heading text-2xl text-white sm:text-3xl">{latestBurst ? latestBurst.teamName : "Sân đấu ổn định"}</div>
                  <div className="mt-1 text-sm text-white/70">
                    {latestBurst
                      ? `Vừa vươn từ hạng ${latestBurst.fromRank} lên hạng ${latestBurst.toRank}.`
                      : "Khi có đội vượt hạng, thông báo sẽ hiện ngay tại đây."}
                  </div>
                </div>
              </div>
            </div>

            <aside className="display-stage__focus rounded-[2rem] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <div className="text-sm font-black uppercase tracking-[0.12em] text-cyan-100/80">Tâm điểm trên sân</div>
              {leader ? (
                <div className="mt-4 rounded-[1.7rem] border border-white/14 bg-white/8 p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[1.5rem] border border-white/16 bg-white/10 p-3">
                      <MascotAvatar
                        family={leader.mascot}
                        level={leader.displayLevel}
                        size={88}
                        glow
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading text-3xl leading-none text-white">{leader.name}</div>
                      <div className="mt-2 text-sm text-white/72">{leaderStage?.name}</div>
                      <div className="mt-3 inline-flex rounded-full border border-white/16 bg-white/12 px-3 py-1 text-sm font-black text-white">
                        {formatPoints(leader.score)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm leading-6 text-white/70">
                    {leaderGap === null
                      ? "Bắt đầu chấm điểm để chọn đội mở màn cho bục vinh danh."
                      : leaderGap > 0
                        ? `${leader.name} đang dẫn ${formatPoints(leaderGap)} so với đội bám sát phía sau.`
                        : "Hai đội đầu đang bám sát nhau. Chỉ một lần cộng điểm là có thể đổi hạng ngay."}
                  </div>
                </div>
              ) : null}

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

              <div className="mt-4 space-y-3">
                <AnimatePresence initial={false}>
                  {rankBursts.length ? (
                    rankBursts.map((burst) => (
                      <motion.div
                        key={burst.id}
                        initial={{ opacity: 0, x: 24, scale: 0.92 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.94 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="display-rank-burst"
                        style={{
                          background: `linear-gradient(135deg, ${burst.accentColor}28 0%, rgba(255,255,255,0.12) 100%)`,
                          borderColor: `${burst.accentColor}66`,
                        }}
                      >
                        <div className="display-rank-burst__label">Đội vừa bứt hạng</div>
                        <div className="mt-2 font-heading text-2xl leading-none text-white">{burst.teamName}</div>
                        <div className="mt-2 text-sm text-white/72">
                          Từ hạng {burst.fromRank} lên hạng {burst.toRank}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      key="steady"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="display-rank-burst display-rank-burst--idle"
                    >
                      <div className="display-rank-burst__label">Nhịp thi đấu</div>
                      <div className="mt-2 text-sm leading-6 text-white/72">
                        Khi có đội vượt hạng, thông báo sẽ hiện ở đây để cả lớp theo dõi kịp thời.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>
          </div>

          <div className="display-podium mt-8">
            {podiumSlots.map((slot) => {
              const stage = slot.team ? getEvolutionStage(slot.team.mascot, slot.team.displayLevel) : null;

              return (
                <div key={`podium-${slot.rank}`} className={cn("display-podium__lane", slot.rank === 1 && "display-podium__lane--center")}>
                  {slot.team ? (
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 160, damping: 18 }}
                      className="display-podium__card"
                    >
                      {slot.rank === 1 ? <div className="display-podium__crown">Đang giữ vị trí #1</div> : null}
                      <div className="flex justify-center">
                        <MascotAvatar
                          family={slot.team.mascot}
                          level={slot.team.displayLevel}
                          size={slot.rank === 1 ? 170 : 138}
                          glow={slot.rank === 1}
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-heading text-3xl leading-none text-white">{slot.team.name}</div>
                        <div className="mt-2 inline-flex rounded-full border border-white/16 bg-white/12 px-3 py-1 text-sm font-black text-white">
                          {formatPoints(slot.team.score)}
                        </div>
                        <div className="mt-2 text-sm text-white/72">{stage?.name}</div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="display-podium__ghost" />
                  )}

                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 160, damping: 20 }}
                    className={cn("display-podium__pedestal", slot.rank === 1 && "display-podium__pedestal--leader")}
                    style={{
                      height: slot.pedestalHeight,
                      background: `linear-gradient(180deg, ${slot.accent} 0%, rgba(255,255,255,0.88) 100%)`,
                    }}
                  >
                    <div className="display-podium__rank">#{slot.rank}</div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="kid-chip border-white/0 bg-white/70 text-sm font-bold text-slate-700 shadow-none">Theo dõi chi tiết</div>
            <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl">Tất cả các đội đang thi đấu</h2>
            <p className="mt-2 text-sm leading-6 text-white/78 sm:text-base">
              {latestBurst
                ? `${latestBurst.teamName} vừa bứt từ hạng ${latestBurst.fromRank} lên hạng ${latestBurst.toRank}.`
                : "Các thẻ bên dưới cập nhật ngay khi điểm số thay đổi."}
            </p>
          </div>
        </section>

        <section className={`mb-5 grid flex-1 gap-4 ${getGridClass(teams.length)}`}>
          {rankedTeams.map((team, index) => (
            <TeamDisplayCard
              key={team.id}
              team={team}
              rank={index + 1}
              isLeader={index === 0}
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
