"use client";

import { AnimatePresence, motion } from "framer-motion";

import { getEvolutionStage, getEvolutionStageCount } from "@/lib/constants";
import { getProgressToNextLevel } from "@/lib/game-logic";
import type { Team } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

import { MascotAvatar } from "./mascot-avatar";
import { ProgressRing } from "./progress-ring";

type TeamDisplayCardProps = {
  team: Team;
  rank: number;
  isLeader: boolean;
};

export function TeamDisplayCard({ team, rank, isLeader }: TeamDisplayCardProps) {
  const stageCount = getEvolutionStageCount(team.mascot);
  const progress = getProgressToNextLevel(team.score, team.unlockedLevel, stageCount);
  const currentStage = getEvolutionStage(team.mascot, team.displayLevel);

  return (
    <motion.article
      layout
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className="arena-panel relative flex min-h-[20rem] flex-col overflow-hidden rounded-[2.4rem] border-2 p-5 text-slate-900 shadow-[0_24px_50px_rgba(97,117,143,0.18)]"
      style={{
        borderColor: `${team.accentColor}66`,
        background: `linear-gradient(180deg, ${team.accentColor}22 0%, rgba(255,255,255,0.94) 36%, rgba(255,255,255,0.9) 100%)`,
      }}
      animate={{
        scale: isLeader ? 1.03 : 0.98 + team.displayLevel * 0.02,
        y: isLeader ? -6 : 0,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_44%)] opacity-80" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-slate-500">Hạng {rank}</div>
          <h3 className="font-heading text-3xl leading-none text-slate-950 sm:text-4xl">{team.name}</h3>
          <p className="mt-2 text-sm text-slate-600">
            {currentStage.name} · Giai đoạn {team.displayLevel}/{stageCount}
          </p>
        </div>
        <div className="rounded-full border-2 border-white/85 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg">
          {formatPoints(team.score)}
        </div>
      </div>

      <div className="relative mt-6 flex flex-1 items-center justify-between gap-4">
        <div className="relative flex flex-1 justify-center">
          <MascotAvatar family={team.mascot} level={team.displayLevel} size={220} glow={isLeader || team.displayLevel >= stageCount} />
          <AnimatePresence>
            {team.lastDelta !== 0 ? (
              <motion.div
                key={`${team.id}-${team.score}`}
                initial={{ opacity: 0, y: 12, scale: 0.7 }}
                animate={{ opacity: [0, 1, 0], y: [12, -18, -40], scale: [0.7, 1, 0.8] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute right-6 top-8 rounded-full bg-white px-4 py-2 text-lg font-black text-slate-900 shadow-2xl"
              >
                {team.lastDelta > 0 ? `+${team.lastDelta}` : team.lastDelta}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-4">
          <ProgressRing
            progress={progress}
            accent={team.accentColor}
            label={`GĐ ${team.unlockedLevel}`}
            sublabel={team.unlockedLevel >= stageCount ? "Tối đa" : "Mốc tiếp theo"}
          />
          {isLeader ? (
            <div className="rounded-full border-2 border-amber-100 bg-amber-300 px-4 py-2 text-xs font-black text-slate-900">
              Đang tạm dẫn đầu
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
