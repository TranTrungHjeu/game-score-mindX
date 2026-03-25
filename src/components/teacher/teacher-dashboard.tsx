"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MascotAvatar } from "@/components/game/mascot-avatar";
import { SessionSummaryOverlay } from "@/components/teacher/session-summary-overlay";
import { getEvolutionStage, getEvolutionStageCount } from "@/lib/constants";
import { getProgressToNextLevel, rankTeams } from "@/lib/game-logic";
import { useClassroomSync } from "@/hooks/use-classroom-sync";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { cn, formatPoints } from "@/lib/utils";
import { useClassroomStore } from "@/store/use-classroom-store";

export default function TeacherDashboard() {
  useClassroomSync();

  const teams = useClassroomStore((state) => state.teams);
  const audioEnabled = useClassroomStore((state) => state.audioEnabled);
  const sessionId = useClassroomStore((state) => state.sessionId);
  const isHydrated = useClassroomStore((state) => state.isHydrated);
  const history = useClassroomStore((state) => state.history);
  const updateTeamScore = useClassroomStore((state) => state.updateTeamScore);
  const undoLastScore = useClassroomStore((state) => state.undoLastScore);
  const replayEvolution = useClassroomStore((state) => state.replayEvolution);
  const toggleAudio = useClassroomStore((state) => state.toggleAudio);
  const resetSession = useClassroomStore((state) => state.resetSession);
  const { playScoreDing, playEvolutionWhoosh } = useSoundEffects(audioEnabled);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const rankedTeams = useMemo(() => rankTeams(teams), [teams]);

  if (!isHydrated) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Đang tải bảng điều khiển...</div>;
  }

  if (!teams.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#d8f7ff_0%,#fff9f0_42%,#fff_100%)] px-6">
        <div className="arena-panel max-w-2xl rounded-[2.4rem] p-8 text-center">
          <div className="font-heading text-5xl text-slate-950">Chưa có phiên học nào.</div>
          <p className="mt-4 text-lg leading-8 text-slate-600">Hãy quay lại phần thiết lập để tạo đội và bắt đầu tiết học.</p>
          <Link href="/setup" className="mt-8 inline-flex rounded-full bg-cyan-500 px-7 py-4 font-black text-white">
            Đi đến thiết lập
          </Link>
        </div>
      </main>
    );
  }

  const handleScore = (teamId: string, delta: number) => {
    const result = updateTeamScore(teamId, delta);

    if (delta > 0) {
      playScoreDing();
    }

    if (result.overlaysAdded.length > 0) {
      playEvolutionWhoosh();
    }
  };

  const handleReplayEvolution = (teamId: string) => {
    const overlay = replayEvolution(teamId);

    if (overlay) {
      playEvolutionWhoosh();
    }
  };

  const handleOpenDisplay = () => {
    window.open("/display", "robotics-display", "noopener,noreferrer");
  };

  const handleUndo = () => {
    undoLastScore();
  };

  const handleReset = () => {
    if (window.confirm("Xóa phiên học hiện tại và tạo lại từ đầu?")) {
      setIsSummaryOpen(false);
      resetSession();
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(255,210,118,0.28),transparent_14%),radial-gradient(circle_at_88%_10%,rgba(56,189,248,0.22),transparent_16%),radial-gradient(circle_at_30%_100%,rgba(244,114,182,0.16),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl">
        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="arena-panel rounded-[2.3rem] p-6 text-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="kid-chip text-sm font-bold text-cyan-700">Bảng chấm điểm</div>
                <h1 className="mt-4 font-heading text-4xl leading-tight text-slate-950 sm:text-5xl">Chấm điểm thật nhanh cho cả lớp</h1>
                <p className="kid-subtle mt-3 max-w-2xl text-base leading-7">
                  Các nút lớn, màu rõ và dễ bấm để cô, thầy thao tác nhanh trong lúc các em đang học.
                </p>
              </div>

              <div className="rounded-[2rem] border-2 border-slate-900/10 bg-slate-900 px-5 py-4 text-white shadow-[0_22px_40px_rgba(15,23,42,0.18)]">
                <div className="text-sm font-bold text-cyan-100/80">Phiên học</div>
                <div className="mt-2 font-heading text-2xl">{sessionId?.slice(0, 10) ?? "Lớp học"}</div>
                <div className="mt-1 text-sm text-white/65">{teams.length} đội đang thi đấu</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleOpenDisplay}
                className="rounded-full border-2 border-cyan-300 bg-cyan-400 px-6 py-3 font-black text-white shadow-[0_16px_32px_rgba(14,165,233,0.22)]"
              >
                Mở màn hình lớp học
              </button>
              <button
                type="button"
                onClick={toggleAudio}
                className={cn(
                  "rounded-full border-2 px-6 py-3 font-black transition",
                  audioEnabled ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/90 bg-white text-slate-700",
                )}
              >
                {audioEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}
              </button>
              <Link href="/setup" className="rounded-full border-2 border-white/90 bg-white px-6 py-3 font-bold text-slate-700">
                Quay lại thiết lập
              </Link>
              <button
                type="button"
                onClick={handleUndo}
                disabled={!history.length}
                className={cn(
                  "rounded-full border-2 px-6 py-3 font-bold transition",
                  history.length
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400",
                )}
              >
                Hoàn tác lượt vừa rồi
              </button>
              <button
                type="button"
                onClick={() => setIsSummaryOpen(true)}
                className="rounded-full border-2 border-violet-200 bg-violet-50 px-6 py-3 font-bold text-violet-700"
              >
                Kết thúc buổi học
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border-2 border-rose-200 bg-rose-50 px-6 py-3 font-bold text-rose-600"
              >
                Đặt lại phiên học
              </button>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="arena-panel rounded-[2.3rem] p-6 text-slate-900">
              <div className="kid-label text-amber-600">Bảng xếp hạng</div>
              <div className="mt-4 space-y-3">
                {rankedTeams.map((team, index) => {
                  const family = team.mascot;
                  const currentStage = getEvolutionStage(team.mascot, team.unlockedLevel);
                  const stageCount = getEvolutionStageCount(team.mascot);
                  return (
                    <div
                      key={team.id}
                      className="flex items-center gap-4 rounded-[1.6rem] border-2 border-white/80 px-4 py-3"
                      style={{
                        background:
                          index === 0
                            ? `linear-gradient(135deg, ${family?.secondary ?? "#fff3b0"}, #ffffff)`
                            : "rgba(255,255,255,0.88)",
                      }}
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-heading text-2xl leading-none text-slate-950">{team.name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {currentStage.name} · Dạng {team.unlockedLevel}/{stageCount}
                        </div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-md">
                        {formatPoints(team.score)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {rankedTeams.map((team) => {
            const stageCount = getEvolutionStageCount(team.mascot);
            const progress = getProgressToNextLevel(team.score, team.unlockedLevel, stageCount);
            const currentStage = getEvolutionStage(team.mascot, team.unlockedLevel);
            return (
              <article
                key={team.id}
                className="arena-panel rounded-[2.2rem] border-2 p-5 text-slate-900"
                style={{
                  borderColor: `${team.accentColor}55`,
                  background: `linear-gradient(180deg, ${team.accentColor}14 0%, rgba(255,255,255,0.94) 30%, rgba(255,255,255,0.9) 100%)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <MascotAvatar
                    family={team.mascot}
                    level={team.displayLevel}
                    size={110}
                    glow={team.unlockedLevel >= stageCount}
                  />
                  <div className="flex-1">
                    <div className="kid-label">Chấm điểm cho đội</div>
                    <h3 className="mt-2 font-heading text-3xl leading-none text-slate-950">{team.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-black text-white">
                        {formatPoints(team.score)}
                      </span>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">
                        Dạng {team.unlockedLevel}/{stageCount}
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
                        {currentStage.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                    <span>{team.unlockedLevel >= stageCount ? "Đã chạm dạng cuối" : "Tiến độ tới lần tiến hóa tiếp theo"}</span>
                    <span>{team.unlockedLevel >= stageCount ? "Tối đa" : `${Math.round(progress * 100)}%`}</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(progress * 100)}%`,
                        background: `linear-gradient(90deg, ${team.accentColor}, #60a5fa)`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, 1)}
                    className="rounded-[1.5rem] border-2 border-emerald-200 bg-emerald-100 px-4 py-4 text-lg font-black text-emerald-900 shadow-[0_16px_28px_rgba(16,185,129,0.16)]"
                  >
                    +1 điểm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, 3)}
                    className="rounded-[1.5rem] border-2 border-emerald-300 bg-emerald-300 px-4 py-4 text-lg font-black text-slate-950 shadow-[0_16px_28px_rgba(52,211,153,0.2)]"
                  >
                    +3 điểm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, 5)}
                    className="rounded-[1.5rem] border-2 border-cyan-300 bg-cyan-400 px-4 py-4 text-lg font-black text-white shadow-[0_16px_28px_rgba(34,211,238,0.2)]"
                  >
                    +5 điểm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, -1)}
                    className="rounded-[1.5rem] border-2 border-rose-200 bg-rose-50 px-4 py-4 text-lg font-black text-rose-600"
                  >
                    Trừ 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReplayEvolution(team.id)}
                    className="rounded-[1.5rem] border-2 border-white/90 bg-white px-4 py-4 text-lg font-black text-slate-700 xl:col-span-2"
                  >
                    Xem tiến hóa
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <SessionSummaryOverlay
        open={isSummaryOpen}
        teams={rankedTeams}
        onClose={() => setIsSummaryOpen(false)}
        onReset={handleReset}
      />
    </main>
  );
}
