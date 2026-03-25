"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MascotAvatar } from "@/components/game/mascot-avatar";
import { getEvolutionStage, getEvolutionStageCount } from "@/lib/constants";
import type { Team } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

type SessionSummaryOverlayProps = {
  open: boolean;
  teams: Team[];
  onClose: () => void;
  onReset: () => void;
};

const PODIUM_STYLES = [
  { rank: 1, accent: "#facc15", label: "Về đích đầu tiên" },
  { rank: 2, accent: "#7dd3fc", label: "Bám đuổi rất sát" },
  { rank: 3, accent: "#f9a8d4", label: "Giữ nhịp rất tốt" },
] as const;

export function SessionSummaryOverlay({ open, teams, onClose, onReset }: SessionSummaryOverlayProps) {
  const rankedTeams = teams.slice(0, 3);
  const winner = rankedTeams[0] ?? null;
  const totalPoints = teams.reduce((sum, team) => sum + team.score, 0);
  const finalFormCount = teams.filter((team) => team.unlockedLevel >= getEvolutionStageCount(team.mascot)).length;

  return (
    <AnimatePresence>
      {open && winner ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-slate-950/70 px-4 py-6 backdrop-blur-md sm:px-6"
        >
          <div className="flex min-h-full items-center justify-center">
            <motion.section
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="arena-panel relative w-full max-w-6xl overflow-hidden rounded-[2.8rem] border-2 border-white/80 p-6 text-slate-900 shadow-[0_32px_80px_rgba(15,23,42,0.34)] sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(253,224,71,0.24),transparent_18%),radial-gradient(circle_at_84%_12%,rgba(56,189,248,0.18),transparent_16%),radial-gradient(circle_at_50%_100%,rgba(244,114,182,0.16),transparent_20%)]" />

              <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
                <div>
                  <div className="kid-chip text-sm font-bold text-amber-700">Tổng kết buổi học</div>
                  <h2 className="mt-4 font-heading text-4xl leading-tight text-slate-950 sm:text-5xl">
                    {winner.name} đang dẫn đầu khi khép lại lượt chấm điểm
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    {winner.name} khép lại buổi học với {formatPoints(winner.score)} và {getEvolutionStage(winner.mascot, winner.unlockedLevel).name}
                    . Bạn có thể mở lại bảng chấm điểm hoặc bắt đầu một phiên mới ngay tại đây.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.6rem] border-2 border-white/90 bg-white/88 px-4 py-4">
                      <div className="text-sm font-bold text-slate-500">Số đội tham gia</div>
                      <div className="mt-2 font-heading text-4xl text-slate-950">{teams.length}</div>
                    </div>
                    <div className="rounded-[1.6rem] border-2 border-white/90 bg-white/88 px-4 py-4">
                      <div className="text-sm font-bold text-slate-500">Tổng điểm cả lớp</div>
                      <div className="mt-2 font-heading text-4xl text-slate-950">{formatPoints(totalPoints)}</div>
                    </div>
                    <div className="rounded-[1.6rem] border-2 border-white/90 bg-white/88 px-4 py-4">
                      <div className="text-sm font-bold text-slate-500">Đội đã chạm dạng cuối</div>
                      <div className="mt-2 font-heading text-4xl text-slate-950">{finalFormCount}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border-2 border-cyan-300 bg-cyan-400 px-6 py-3 font-black text-white shadow-[0_18px_34px_rgba(14,165,233,0.24)]"
                    >
                      Quay lại chấm điểm
                    </button>
                    <button
                      type="button"
                      onClick={onReset}
                      className="rounded-full border-2 border-rose-200 bg-rose-50 px-6 py-3 font-bold text-rose-600"
                    >
                      Bắt đầu phiên mới
                    </button>
                  </div>
                </div>

                <aside className="rounded-[2rem] border-2 border-white/80 bg-white/72 p-5">
                  <div className="text-sm font-black uppercase tracking-[0.1em] text-slate-500">Bục vinh danh</div>
                  <div className="mt-4 space-y-3">
                    {rankedTeams.map((team, index) => {
                      const stageCount = getEvolutionStageCount(team.mascot);
                      const stage = getEvolutionStage(team.mascot, team.unlockedLevel);
                      const style = PODIUM_STYLES[index] ?? PODIUM_STYLES[PODIUM_STYLES.length - 1];

                      return (
                        <div
                          key={team.id}
                          className="rounded-[1.8rem] border-2 px-4 py-4"
                          style={{
                            borderColor: `${style.accent}66`,
                            background: `linear-gradient(135deg, ${style.accent}22 0%, rgba(255,255,255,0.9) 100%)`,
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">
                              {style.rank}
                            </div>
                            <MascotAvatar family={team.mascot} level={team.unlockedLevel} size={84} glow={index === 0} animate={false} />
                            <div className="min-w-0 flex-1">
                              <div className="font-heading text-2xl leading-none text-slate-950">{team.name}</div>
                              <div className="mt-2 text-sm text-slate-600">
                                {stage.name} · Dạng {team.unlockedLevel}/{stageCount}
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">
                                  {formatPoints(team.score)}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                                  {style.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </aside>
              </div>
            </motion.section>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
