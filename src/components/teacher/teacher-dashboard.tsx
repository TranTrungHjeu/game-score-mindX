"use client";

import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EvolutionOverlay } from "@/components/game/evolution-overlay";
import { MascotAvatar } from "@/components/game/mascot-avatar";
import { SessionSummaryOverlay } from "@/components/teacher/session-summary-overlay";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { getProgressToNextLevel, rankTeams } from "@/lib/game-logic";
import { useClassroomSync } from "@/hooks/use-classroom-sync";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { getEvolutionStageCount, getMegaWinsForTeam, isMegaReady, resolveTeamVisual, supportsMegaEvolution } from "@/lib/pokemon-helpers";
import { cn, formatPoints } from "@/lib/utils";
import { useClassroomStore } from "@/store/use-classroom-store";

type ConfirmIntent =
  | { type: "reset_session" }
  | { type: "remove_question"; questionId: string; questionNumber: number }
  | null;

function MegaStatus({
  teamId,
  questionsCount,
}: {
  teamId: string;
  questionsCount: number;
}) {
  const teams = useClassroomStore((state) => state.teams);
  const questions = useClassroomStore((state) => state.questions);
  const triggerMegaEvolution = useClassroomStore((state) => state.triggerMegaEvolution);
  const team = teams.find((item) => item.id === teamId);

  if (!team || !supportsMegaEvolution(team.mascot) || !questionsCount) {
    return null;
  }

  const maxLevel = getEvolutionStageCount(team.mascot);

  if (team.megaActive || !isMegaReady(team, questions) || team.unlockedLevel < maxLevel) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        triggerMegaEvolution(team.id);
      }}
      className="rounded-none border-2 border-yellow-700/20 bg-yellow-700 px-4 py-2 text-sm font-black text-white shadow-[0_16px_28px_rgba(161,98,7,0.18)]"
    >
      Tiến hóa mega
    </button>
  );
}

export default function TeacherDashboard() {
  useClassroomSync();

  const teams = useClassroomStore((state) => state.teams);
  const questions = useClassroomStore((state) => state.questions);
  const overlayQueue = useClassroomStore((state) => state.overlayQueue);
  const audioEnabled = useClassroomStore((state) => state.audioEnabled);
  const isHydrated = useClassroomStore((state) => state.isHydrated);
  const history = useClassroomStore((state) => state.history);
  const updateTeamScore = useClassroomStore((state) => state.updateTeamScore);
  const undoLastScore = useClassroomStore((state) => state.undoLastScore);
  const replayEvolution = useClassroomStore((state) => state.replayEvolution);
  const setQuestionWinner = useClassroomStore((state) => state.setQuestionWinner);
  const updateQuestionPrompt = useClassroomStore((state) => state.updateQuestionPrompt);
  const addQuestion = useClassroomStore((state) => state.addQuestion);
  const removeQuestion = useClassroomStore((state) => state.removeQuestion);
  const resetSession = useClassroomStore((state) => state.resetSession);
  const consumeEvolution = useClassroomStore((state) => state.consumeEvolution);
  const { playScoreDing } = useSoundEffects(audioEnabled);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [confirmIntent, setConfirmIntent] = useState<ConfirmIntent>(null);

  const rankedTeams = useMemo(() => rankTeams(teams), [teams]);
  const activeOverlay = overlayQueue[0] ?? null;
  const megaTeamsExist = useMemo(() => teams.some((team) => supportsMegaEvolution(team.mascot)), [teams]);

  const handleScore = (teamId: string, delta: number) => {
    updateTeamScore(teamId, delta);

    if (delta > 0) {
      playScoreDing();
    }
  };

  const handleReplayEvolution = (teamId: string) => {
    replayEvolution(teamId);
  };

  const handleUndo = () => {
    undoLastScore();
  };

  const handleResetRequest = () => {
    setConfirmIntent({ type: "reset_session" });
  };

  const handleRemoveQuestionRequest = (questionId: string, questionNumber: number) => {
    setConfirmIntent({ type: "remove_question", questionId, questionNumber });
  };

  const handleConfirmAction = () => {
    if (!confirmIntent) {
      return;
    }

    if (confirmIntent.type === "reset_session") {
      setIsSummaryOpen(false);
      resetSession();
    }

    if (confirmIntent.type === "remove_question") {
      removeQuestion(confirmIntent.questionId);
    }

    setConfirmIntent(null);
  };

  if (!isHydrated) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Đang tải bảng điều khiển...</div>;
  }

  if (!teams.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#fff1e8_0%,#fff9f1_42%,#ffffff_100%)] px-6">
        <div className="arena-panel max-w-2xl rounded-none p-8 text-center">
          <div className="font-heading text-5xl text-slate-950">Chưa có phiên học nào.</div>
          <p className="mt-4 text-lg leading-8 text-slate-600">Hãy quay lại phần thiết lập để tạo đội và bắt đầu tiết học.</p>
          <Link href="/setup" className="mt-8 inline-flex rounded-none bg-red-600 px-7 py-4 font-black text-white">
            Đi đến thiết lập
          </Link>
        </div>
      </main>
    );
  }

  const podiumSlots = [
    { team: rankedTeams[1] ?? null, rank: 2, pedestalHeight: 92, accent: "#dbeafe" },
    { team: rankedTeams[0] ?? null, rank: 1, pedestalHeight: 128, accent: "#fde68a" },
    { team: rankedTeams[2] ?? null, rank: 3, pedestalHeight: 78, accent: "#fbcfe8" },
  ] as const;
  const leadingTeam = rankedTeams[0] ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(201,31,46,0.1),transparent_14%),radial-gradient(circle_at_88%_10%,rgba(170,118,16,0.1),transparent_16%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(201,31,46,0.04)_100%)]" />
      <div className="relative mx-auto max-w-7xl">
        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="arena-panel rounded-none p-6 text-slate-900">
            <div className="flex flex-wrap items-center gap-3">
              <div className="kid-chip text-sm font-bold text-red-800">Bảng chấm điểm</div>
            </div>

            <section className="display-stage teacher-stage relative mt-5 overflow-hidden rounded-none px-4 py-5 text-white shadow-[0_24px_56px_rgba(7,18,40,0.28)] sm:px-5">
              <div className="display-stage__glow absolute left-1/2 top-[-4rem] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full" />
              <div className="display-stage__spotlights pointer-events-none absolute inset-0" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-none border border-white/14 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-white/88">
                    Bậc xếp hạng hiện tại
                  </div>
                  {leadingTeam ? (
                    <div className="text-sm font-semibold text-white/78">
                      Đội đang dẫn đầu: <span className="font-black text-white">{leadingTeam.name}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 overflow-x-auto pb-1">
                  <div className="display-podium teacher-podium min-w-[30rem]">
                    {podiumSlots.map((slot) => {
                      const visual = slot.team ? resolveTeamVisual(slot.team) : null;
                      const stageCount = slot.team ? getEvolutionStageCount(slot.team.mascot) : 1;

                      return (
                        <div
                          key={`teacher-podium-${slot.rank}`}
                          className={cn("display-podium__lane", slot.rank === 1 && "display-podium__lane--center")}
                        >
                          {slot.team ? (
                            <div className="display-podium__card">
                              <div className="flex justify-center">
                                <MascotAvatar
                                  family={slot.team.mascot}
                                  level={visual?.isMega ? stageCount : slot.team.displayLevel}
                                  stage={visual?.stage}
                                  size={slot.rank === 1 ? 132 : 108}
                                  glow={slot.rank === 1}
                                />
                              </div>
                              <div className="mt-3 text-center">
                                <div className="font-heading text-2xl leading-none text-white">{slot.team.name}</div>
                                <div className="mt-2 inline-flex rounded-none border border-white/16 bg-white/12 px-3 py-1 text-sm font-black text-white">
                                  {formatPoints(slot.team.score)}
                                </div>
                                <div className="mt-2 text-xs font-semibold text-white/72">{visual?.stage.name}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="display-podium__ghost" />
                          )}

                          <div
                            className={cn("display-podium__pedestal", slot.rank === 1 && "display-podium__pedestal--leader")}
                            style={{
                              height: slot.pedestalHeight,
                              background: `linear-gradient(180deg, ${slot.accent} 0%, rgba(255,255,255,0.88) 100%)`,
                            }}
                          >
                            <div className="display-podium__rank">#{slot.rank}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

          </div>

          <aside className="space-y-5">
            <div className="arena-panel rounded-none p-6 text-slate-900">
              <div className="kid-label text-yellow-800">Điều khiển nhanh</div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/setup"
                  className="min-w-0 rounded-none border-2 border-white/90 bg-white px-3.5 py-2 text-sm font-bold text-slate-700"
                >
                  Quay lại thiết lập
                </Link>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!history.length}
                  className={cn(
                    "min-w-0 rounded-none border-2 px-3.5 py-2 text-sm font-bold transition",
                    history.length
                      ? "border-yellow-700/20 bg-yellow-50 text-yellow-800"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400",
                  )}
                >
                  Hoàn tác lượt vừa rồi
                </button>
                <button
                  type="button"
                  onClick={() => setIsSummaryOpen(true)}
                  className="min-w-0 rounded-none border-2 border-yellow-700/20 bg-yellow-50 px-3.5 py-2 text-sm font-bold text-yellow-800"
                >
                  Kết thúc buổi học
                </button>
                <button
                  type="button"
                  onClick={handleResetRequest}
                  className="min-w-0 rounded-none border-2 border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-bold text-rose-600"
                >
                  Đặt lại phiên học
                </button>
              </div>
            </div>

            {megaTeamsExist ? (
              <div className="arena-panel rounded-none p-6 text-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="kid-label text-yellow-800">Câu hỏi mega</div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    disabled={questions.length >= 5}
                    className={cn(
                      "rounded-none border-2 px-3 py-2 text-sm font-black transition",
                      questions.length >= 5
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-yellow-700/20 bg-yellow-50 text-yellow-800",
                    )}
                  >
                    Thêm câu
                  </button>
                </div>
                {questions.length ? (
                  <div className="mt-4 space-y-4">
                  {questions.map((question, questionIndex) => (
                    <article key={question.id} className="rounded-none border-2 border-white/85 bg-white/90 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-black text-slate-500">Câu {questionIndex + 1}</div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionRequest(question.id, questionIndex + 1)}
                          className="rounded-none border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-600 transition hover:bg-rose-100"
                        >
                          Xóa câu
                        </button>
                      </div>
                      <input
                        value={question.prompt}
                        onChange={(event) => updateQuestionPrompt(question.id, event.target.value)}
                        className="mt-2 w-full rounded-none border-2 border-slate-100 bg-white px-4 py-3 text-base font-semibold leading-7 text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                        placeholder={`Nhập câu ${questionIndex + 1} khi đang dạy`}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {rankedTeams.map((team) => (
                          <button
                            key={`${question.id}-${team.id}`}
                            type="button"
                            onClick={() => setQuestionWinner(question.id, team.id)}
                            disabled={question.prompt.trim().length === 0}
                            className={cn(
                              "rounded-none border-2 px-4 py-2 text-sm font-bold transition",
                              question.winnerTeamId === team.id
                                ? "border-red-300 bg-red-600 text-white"
                                : question.prompt.trim().length === 0
                                  ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                                  : "border-slate-100 bg-slate-50 text-slate-600 hover:border-red-200 hover:text-red-700",
                            )}
                          >
                            {team.name}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-none border-2 border-dashed border-white/85 bg-white/80 px-4 py-5 text-sm font-medium leading-7 text-slate-500">
                    Chưa có câu hỏi mega nào. Bạn có thể bấm <span className="font-black text-slate-900">Thêm câu</span> ngay trong lúc dạy.
                  </div>
                )}
              </div>
            ) : null}
          </aside>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {rankedTeams.map((team) => {
            const stageCount = getEvolutionStageCount(team.mascot);
            const progress = getProgressToNextLevel(team.score, team.unlockedLevel, stageCount);
            const visual = resolveTeamVisual(team);
            return (
              <article
                key={team.id}
                className="arena-panel flex h-full flex-col rounded-none border-2 p-5 text-slate-900"
                style={{
                  borderColor: `${team.accentColor}2f`,
                  background: `linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,252,255,0.96) 72%, ${team.accentColor}0e 100%)`,
                }}
              >
                <div className="flex items-start gap-4">
                  <MascotAvatar
                    family={team.mascot}
                    level={visual.isMega ? stageCount : team.displayLevel}
                    stage={visual.stage}
                    size={138}
                    glow={visual.isMega || team.unlockedLevel >= stageCount}
                  />
                  <div className="flex min-h-[10.5rem] flex-1 flex-col">
                    <h3 className="min-h-[3.5rem] font-heading text-2xl leading-[1.08] text-slate-950 sm:text-[1.7rem] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden break-words">
                      {team.name}
                    </h3>
                    <div className="mt-2 flex min-h-[2.5rem] flex-wrap content-start items-start gap-2">
                      <span className="rounded-none bg-slate-900 px-3 py-1 text-sm font-black text-white">
                        {formatPoints(team.score)}
                      </span>
                    </div>
                    <div className="mt-3 flex min-h-[2.75rem] flex-wrap content-start gap-2">
                      <MegaStatus teamId={team.id} questionsCount={questions.length} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex-1">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                    <span>{team.unlockedLevel >= stageCount ? "Đã chạm dạng cuối" : "Tiến độ tới lần tiến hóa tiếp theo"}</span>
                    <span>{team.unlockedLevel >= stageCount ? "Tối đa" : `${Math.round(progress * 100)}%`}</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-none bg-slate-100">
                    <div
                      className="h-full rounded-none transition-all duration-500"
                      style={{
                        width: `${Math.round(progress * 100)}%`,
                        background: `linear-gradient(90deg, ${team.accentColor}, #a16207)`,
                      }}
                    />
                  </div>
                  {supportsMegaEvolution(team.mascot) && questions.length ? (
                    <div className="mt-3 text-sm font-semibold text-slate-500">
                      {team.megaActive
                        ? `${visual.stage.name} đang ở trạng thái mega.`
                        : isMegaReady(team, questions)
                          ? "Đội đã có Đá Mega và có thể mega ngay."
                          : `Đá Mega hiện có: ${getMegaWinsForTeam(team.id, questions)}`}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, 1)}
                    className="rounded-none border-2 border-red-200 bg-red-50 px-4 py-4 text-lg font-black text-red-800 shadow-[0_16px_28px_rgba(185,28,28,0.12)]"
                  >
                    +1 điểm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, 3)}
                    className="rounded-none border-2 border-red-300 bg-red-200 px-4 py-4 text-lg font-black text-red-900 shadow-[0_16px_28px_rgba(185,28,28,0.14)]"
                  >
                    +3 điểm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, 5)}
                    className="rounded-none border-2 border-red-400 bg-red-600 px-4 py-4 text-lg font-black text-white shadow-[0_16px_28px_rgba(185,28,28,0.2)]"
                  >
                    +5 điểm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScore(team.id, -1)}
                    className="rounded-none border-2 border-yellow-700/15 bg-yellow-50 px-4 py-4 text-lg font-black text-yellow-800"
                  >
                    Trừ 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReplayEvolution(team.id)}
                    className="rounded-none border-2 border-white/90 bg-white px-4 py-4 text-lg font-black text-slate-700 xl:col-span-2"
                  >
                    Xem biến đổi gần nhất
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <SessionSummaryOverlay open={isSummaryOpen} teams={rankedTeams} onClose={() => setIsSummaryOpen(false)} onReset={handleResetRequest} />
      <ConfirmActionModal
        open={confirmIntent !== null}
        title={
          confirmIntent?.type === "remove_question"
            ? `Xóa Câu ${confirmIntent.questionNumber}?`
            : "Đặt lại phiên học?"
        }
        description={
          confirmIntent?.type === "remove_question"
            ? "Nếu câu này đang trao Đá Mega cho đội nào đó, đội đó có thể mất mega và bị hạ dạng ngay."
            : "Thao tác này sẽ xóa toàn bộ điểm, đội và trạng thái hiện tại để bắt đầu lại từ đầu."
        }
        confirmLabel={confirmIntent?.type === "remove_question" ? "Xóa câu" : "Đặt lại"}
        cancelLabel="Quay lại"
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmIntent(null)}
      />
      <AnimatePresence>
        {activeOverlay ? (
          <EvolutionOverlay
            key={activeOverlay.id}
            overlay={activeOverlay}
            audioEnabled={audioEnabled}
            onComplete={() => consumeEvolution(activeOverlay.id)}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
